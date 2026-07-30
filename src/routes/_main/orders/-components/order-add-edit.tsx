import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import DocumentFiles from "@/components/files/document-files"
import DatepickerField from "@/components/form/datepicker-field"
import NumberField from "@/components/form/number-field"
import PaginatedSelectField from "@/components/form/paginated-select-field"
import SelectField from "@/components/form/select-field"
import SwitchField from "@/components/form/switch-field"
import UncontrolledInput from "@/components/form/uncontrolled-input"
import UncontrolledTextarea from "@/components/form/uncontrolled-textarea"
import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useGet } from "@/hooks/react-query/use-get"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import {
    useSaleClientsQuery,
    useSaleCurrenciesQuery,
    useSalePaymentTypesQuery,
} from "@/hooks/react-query/use-sale-refs"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { contentAreaElement } from "@/lib/utils/content-area"
import { formatNumber } from "@/lib/utils/format-number"
import { cn } from "@/lib/utils/shadcn"
import ClientAddEditModal from "@/routes/_main/clients/-components/client-add-edit"
import { useClientStore } from "@/routes/_main/clients/-hooks/use-client-store"
import type { ReadyProduct } from "@/routes/_main/ready-products/-types"
import type { RollingPlan } from "@/routes/_main/rolling-plans/-types"
import type { PaginatedResponse } from "@/types/common"
import { format } from "date-fns"
import {
    CircleHelpIcon,
    PlusIcon,
    PrinterIcon,
    Trash2,
    TruckIcon,
} from "lucide-react"
import { useEffect, useMemo, useRef, type ReactNode } from "react"
import {
    useFieldArray,
    useForm,
    useWatch,
    type UseFormReturn,
} from "react-hook-form"
import { useTranslation } from "react-i18next"
import type { SourceInfo } from "react-number-format"
import { toast } from "sonner"
import { useOrderStore } from "../-hooks/use-order-store"
import type {
    OrderForm,
    OrderItemForm,
    ProductStock,
    SaleClient,
    SaleItemUnit,
    SaleProduct,
} from "../-types"
import CurrencyRateField from "./currency-rate-field"
import {
    lineTotal,
    metersPerPack,
    orderTotals,
    perTonFromPrice,
    piecesPerPack,
    priceFromPerTon,
    quantityBase,
    quantityInUnit,
    unitPrice,
    weightMode,
    weightPerMeter,
    weightTn,
} from "./item-math"
import { ORDER_PRINT_MODAL } from "./order-print-modal"
import { useOrderStatusOptions } from "./status-config"

/** Ready-product label — matches the "Ready Products" screen: `thickness x width`. */
const readyProductLabel = (
    rp: Pick<ReadyProduct, "id" | "thickness" | "width">,
) => [rp.thickness, rp.width].filter(Boolean).join(" x ") || `#${rp.id}`

const EMPTY_ITEM: OrderItemForm = {
    product_id: null,
    price: null,
    quantity: null,
    unit: "meter",
    weight_mode: "theoretical",
    price_per_ton: 0,
    discount: 0,
    vat: 0,
    reserve: 0,
    product: null,
}

/** The client modal opened from inside the order form. */
const ORDER_CLIENT_MODAL = "add-client-from-order"

/**
 * The sales sheet colours its columns: what the seller types stays white
 * (наименование, кол-во, ед. изм., цена за вес) and everything the sheet
 * derives sits on a tint (кол-во б. ед., отгружено, доступно, остаток, вес,
 * цена, сумма). The table below repeats that, so a row reads as
 * «typed → derived → typed → derived» at a glance instead of eleven equal cells.
 */
const CALC = "bg-muted/40"
/** Where the sheet switches between a typed and a derived block. */
const GROUP = "border-l"

/**
 * Компактный вид выпадающих списков документа. По умолчанию react-select
 * держит control на 40 px, и рядом с полями заказа (32 px) он выпирал; здесь
 * те же классы, но вровень с соседями и тем же кеглем.
 */
const DENSE_SELECT = {
    control: ({
        isFocused,
        isDisabled,
    }: {
        isFocused: boolean
        isDisabled: boolean
    }) =>
        cn(
            "min-h-8! flex min-w-0 rounded-md border border-input bg-background px-2 text-xs shadow-sm transition-colors",
            isFocused && "outline-none ring-2 ring-ring",
            isDisabled && "opacity-50",
        ),
    option: ({ isSelected }: { isSelected: boolean }) =>
        cn(
            "border-b last:border-none first:rounded-t-md last:rounded-b-md px-2 py-1.5 text-xs! outline-none hover:bg-secondary",
            isSelected && "bg-primary/70 hover:bg-primary/70 text-background",
        ),
    // Длинное имя клиента («ООО ...») не должно распирать свою колонку — оно
    // обрезается многоточием, целиком видно в списке.
    valueContainer: () => "gap-1 min-w-0 overflow-hidden",
    singleValue: () => "truncate",
}

/**
 * The line maths runs on three numbers of the product card — теор. вес, факт.
 * вес and метров в пачке. A row restored from a saved order (or picked from a
 * list that trims them) may carry only some of them, and then «кол-во б. ед.»
 * of a pack line stays empty. This reads the product itself and fills the
 * snapshot in; it renders nothing.
 */
function ProductFacts({
    form,
    index,
    productId,
    snapshot,
    onFilled,
}: {
    form: UseFormReturn<OrderForm>
    index: number
    productId: number | null
    snapshot: OrderItemForm["product"]
    /** Вес метра стал известен — цену за метр надо пересчитать. */
    onFilled: () => void
}) {
    const incomplete =
        !!productId &&
        (snapshot?.theoretical_weight_used == null ||
            snapshot?.actual_weight_used == null ||
            snapshot?.meters_per_pack == null ||
            snapshot?.extra_fields == null)

    const { data } = useGet<SaleProduct>(
        API.EXTRA.PRODUCTS.ID.INDEX.replace("{id}", String(productId ?? "")),
        { options: { enabled: incomplete } },
    )

    useEffect(() => {
        if (!data || !incomplete) return
        form.setValue(`items.${index}.product`, {
            theoretical_weight: data.theoretical_weight ?? null,
            actual_weight: data.actual_weight ?? null,
            theoretical_weight_used: data.theoretical_weight_used ?? null,
            actual_weight_used: data.actual_weight_used ?? null,
            meters_per_pack: data.meters_per_pack ?? null,
            extra_fields: data.extra_fields ?? {},
        })
        onFilled()
        // `incomplete` is what triggered the fetch — reacting to it as well
        // would rewrite the snapshot on every keystroke.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, index, form])

    return null
}

/**
 * Длина трубы по товарам — из планов прокатки.
 *
 * Карточка товара хранит «Шт в пачке», но не длину: одну и ту же трубу катают
 * и по 6, и по 12 метров, и длина живёт в плане прокатки. Пачку в метры
 * переводит «Шт в пачке» × длина последнего плана по этому товару. Планы
 * тянутся только когда в документе действительно появилась строка в пачках.
 */
function usePipeLengths(enabled: boolean) {
    const { data } = useGet<PaginatedResponse<RollingPlan>>(
        API.ROLLING_PLANS.INDEX,
        { params: { page_size: 200 }, options: { enabled } },
    )

    return useMemo(() => {
        const byProduct = new Map<number, number>()
        // Список идёт от свежих планов к старым — первая найденная длина и
        // есть последняя, по которой катали.
        for (const plan of data?.results ?? []) {
            for (const line of plan.items ?? []) {
                const productId = line.product?.id
                const lengthMm = Number(line.pipe_length_mm ?? 0)
                if (!productId || lengthMm <= 0) continue
                if (!byProduct.has(productId))
                    byProduct.set(productId, lengthMm)
            }
        }
        return byProduct
    }, [data])
}

/** Delivery address as written on the client card. */
const clientAddress = (client: SaleClient) =>
    [client.region_address, client.exact_address].filter(Boolean).join(", ") ||
    client.legal_address ||
    ""

/**
 * Колонка, которой не хватило числа из карточки товара. Ноль на её месте
 * выглядел бы посчитанным, поэтому вместо него — знак с подсказкой, чего
 * именно не хватает.
 */
function Missing({ hint }: { hint: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="cursor-help font-semibold text-amber-600">
                    !
                </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{hint}</TooltipContent>
        </Tooltip>
    )
}

/**
 * Одна карточка документа: заголовок с необязательным действием справа и тело.
 *
 * Раньше блоки заказа шли сплошным потоком — поля, таблица, итоги и файлы
 * висели на одном фоне, и глазу не за что было зацепиться. Карточка отделяет
 * «шапку документа» от «позиций» и «итогов», а кнопка блока (например
 * «Добавить товар») живёт в его же заголовке, а не болтается под таблицей.
 */
function Section({
    title,
    action,
    children,
    bodyClassName,
    className,
}: {
    title: string
    action?: ReactNode
    children: ReactNode
    /** `p-0`, когда тело само знает свои отступы (таблица, файлы). */
    bodyClassName?: string
    className?: string
}) {
    return (
        <section
            className={cn(
                "flex flex-col overflow-hidden rounded-xl border bg-card",
                className,
            )}
        >
            <header className="flex min-h-11 shrink-0 flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-4 py-2">
                <h3 className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {title}
                </h3>
                {action}
            </header>
            <div className={cn("flex-1 p-4", bodyClassName)}>{children}</div>
        </section>
    )
}

/** One line of the totals block. */
function Total({
    label,
    value,
    scale = 2,
    strong,
}: {
    label: string
    value: number
    scale?: number
    strong?: boolean
}) {
    return (
        <div
            className={`flex justify-between gap-4 ${strong ? "border-t pt-2 text-sm font-semibold" : ""}`}
        >
            <span className={strong ? "" : "text-muted-foreground"}>
                {label}:
            </span>
            <span className="tabular-nums whitespace-nowrap">
                {formatNumber(value, { decimalScale: scale, isShowZero: true })}
            </span>
        </div>
    )
}

export default function OrderAddEditModal() {
    const { isOpen } = useModal("add-order")
    const container = isOpen ? contentAreaElement() : null

    return (
        <Modal
            modalKey="add-order"
            title={null}
            container={container}
            overlayClassName="absolute inset-0 z-40"
            wrapperClassname="absolute inset-0 top-0! translate-x-0 translate-y-0 w-full! max-w-full! md:max-w-full! rounded-none border-0 p-0! md:p-0!"
            className="h-full max-h-full w-full max-w-none px-4 py-4 md:px-6"
            // z-30 — выше прилипшей шапки формы (z-20), иначе она накрывает
            // крестик и его нечем нажать.
            closeButtonClassName="top-3! right-3! z-30 text-foreground rounded-md p-1 hover:bg-muted"
        >
            <OrderAddEdit />
        </Modal>
    )
}

function OrderAddEdit() {
    const { t } = useTranslation()
    const { closeModal } = useModal("add-order")
    const { invalidateByExactMatch } = useRevalidate()
    const { order } = useOrderStore()
    const { post, patch, isPending } = useRequest()
    const statusOptions = useOrderStatusOptions()
    const printModal = useModal(ORDER_PRINT_MODAL)
    const createDemandModal = useModal("create-demand")
    const clientModal = useModal(ORDER_CLIENT_MODAL)
    const { setClient } = useClientStore()

    // A client missing from the list can be created without leaving the order:
    // the card opens empty (no `client` in the store means "add", not "edit").
    const openClientModal = () => {
        setClient(null)
        clientModal.openModal()
    }

    // Sheet dictionaries: unit of the line, which weight prices it, and what
    // the delivery cost does to the total.
    const unitOptions = [
        { id: "meter", name: t("common.meter") },
        { id: "pack", name: t("common.pack") },
        { id: "ton", name: t("common.ton") },
    ]
    const deliveryModeOptions = [
        { id: "in_total", name: t("common.deliveryInTotal") },
        { id: "split", name: t("common.deliverySplit") },
    ]

    const { clientList } = useSaleClientsQuery()
    const { paymentTypeList } = useSalePaymentTypesQuery()
    const { currencyList } = useSaleCurrenciesQuery()
    const clientOptions = clientList.map((c) => ({
        id: c.id,
        name: c.full_name,
    }))
    const paymentTypeOptions = paymentTypeList.map((p) => ({
        id: p.id,
        name: p.name,
    }))
    const currencyOptions = currencyList.map((c) => ({
        id: c.id,
        name: `${c.currency} (${c.current_rate})`,
    }))

    const form = useForm<OrderForm>({
        defaultValues: {
            client_id: null,
            payment_type_id: null,
            currency_id: null,
            client_currency: null,
            contract_number: "",
            lot_number: "",
            warehouse_id: null,
            // Not asked for — the document is dated by the day it is created.
            doc_date: format(new Date(), "yyyy-MM-dd"),
            delivery_planned_date: null,
            shipment_address: "",
            description: "",
            status: "new",
            vat_enabled: false,
            vat_included: true,
            applicable: false,
            delivery_cost: 0,
            delivery_mode: "in_total",
            items: [{ ...EMPTY_ITEM }],
        },
        values:
            order ?
                {
                    client_id: order.client?.id ?? null,
                    payment_type_id:
                        paymentTypeList.find(
                            (p) => p.name === order.payment_type,
                        )?.id ?? null,
                    currency_id: order.currency?.id ?? null,
                    client_currency:
                        order.client_currency ?
                            Number(order.client_currency)
                        :   null,
                    contract_number: order.contract_number ?? "",
                    lot_number: order.lot_number ?? "",
                    warehouse_id: order.warehouse?.id ?? null,
                    doc_date:
                        (order.doc_date ?? order.created_at)?.slice(0, 10) ??
                        null,
                    delivery_planned_date: order.delivery_planned_date,
                    shipment_address: order.shipment_address ?? "",
                    description: order.description ?? "",
                    status: order.status ?? "new",
                    vat_enabled: order.vat_enabled,
                    vat_included: order.vat_included,
                    applicable: order.applicable,
                    delivery_cost: Number(order.delivery_cost ?? 0),
                    delivery_mode: order.delivery_mode ?? "in_total",
                    items:
                        order.items?.length ?
                            order.items.map((item) => ({
                                id: item.id,
                                product_id: item.product?.id ?? null,
                                price: Number(item.price),
                                quantity: Number(item.quantity),
                                unit: item.unit ?? "meter",
                                weight_mode: item.weight_mode ?? "theoretical",
                                price_per_ton: Number(item.price_per_ton ?? 0),
                                discount: Number(item.discount),
                                vat: item.vat,
                                reserve: Number(item.reserve),
                                product: item.product ?? null,
                            }))
                        :   [{ ...EMPTY_ITEM }],
                }
            :   undefined,
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    // `useWatch` rather than `form.watch` — a real subscription, so the derived
    // columns and totals re-render on every keystroke.
    const values = useWatch({ control: form.control }) as OrderForm
    const watchedItems = values.items
    const totals = orderTotals(values)

    /**
     * «Цена за Вес, Т» и «Цена» — два взгляда на одни деньги: цена за тонну и
     * цена за метр, связанные весом погонного метра. Продавец называет ту,
     * которая у него на руках (в МойСкладе это цена за метр — 7,07 за метр
     * даёт 7 070 за тысячу), вторая пересчитывается сама. Пишем всегда обе,
     * поэтому «Сумма» не зависит от того, в какое поле попали цифры.
     *
     * Пересчёт запускает только набор с клавиатуры. `NumericFormat` зовёт
     * `onValueChange` и когда значение пришло сверху пропом — без этой
     * проверки поля будили друг друга по кругу и на каждом витке округляли
     * число заново, затирая набираемые цифры.
     */
    const typedByUser = (info?: SourceInfo) => info?.source === "event"

    const setPricePerTon = (index: number, perTon: number) => {
        const item = form.getValues(`items.${index}`)
        form.setValue(`items.${index}.price_per_ton`, perTon, {
            shouldDirty: true,
        })
        form.setValue(`items.${index}.price`, priceFromPerTon(item, perTon), {
            shouldDirty: true,
        })
    }
    const setPrice = (index: number, price: number) => {
        const item = form.getValues(`items.${index}`)
        form.setValue(`items.${index}.price`, price, { shouldDirty: true })
        form.setValue(
            `items.${index}.price_per_ton`,
            perTonFromPrice(item, price),
            { shouldDirty: true },
        )
    }
    /** Вес метра поменялся (другой товар) — цена за метр тоже. */
    const repriceFromPerTon = (index: number) => {
        const item = form.getValues(`items.${index}`)
        const perTon = Number(item.price_per_ton ?? 0)
        if (perTon > 0) {
            form.setValue(`items.${index}.price`, priceFromPerTon(item, perTon))
        }
    }

    /**
     * Смена «Ед. изм.» — как в МойСкладе: строка остаётся тем же товаром в том
     * же объёме, меняется только то, в чём его считают. 5 000 м превращаются в
     * 10 пачек по 500 м, а «Кол-во б. ед.», вес и сумма не шелохнутся.
     *
     * `prev` — строка до переключения: селект зовёт `onValueChange` раньше, чем
     * кладёт новую единицу в форму, поэтому старое количество надо взять из
     * снимка, а не перечитывать форму.
     */
    const changeUnit = (
        index: number,
        prev: OrderItemForm,
        nextUnit: SaleItemUnit,
    ) => {
        const next: OrderItemForm = {
            ...prev,
            unit: nextUnit,
            weight_mode: nextUnit === "ton" ? "actual" : "theoretical",
        }
        form.setValue(`items.${index}.weight_mode`, next.weight_mode)

        const converted = quantityInUnit(next, quantityBase(prev))
        // Ноль — перевести нечем (пачка без длины трубы, тонна без веса):
        // тогда количество остаётся как есть, а строка сама скажет знаком «!»,
        // какого числа карточке не хватило.
        if (converted > 0) {
            form.setValue(`items.${index}.quantity`, converted, {
                shouldDirty: true,
            })
            next.quantity = converted
        }

        // Цена за метр и цена за тонну — разные числа: пересчитываем от той,
        // что назвал продавец.
        const perTon = Number(next.price_per_ton ?? 0)
        if (perTon > 0) {
            form.setValue(`items.${index}.price`, priceFromPerTon(next, perTon))
        }
    }

    // «Доступно» и «Остаток» приходят одной ручкой на все выбранные товары —
    // строка их только показывает. Список id отсортирован, чтобы порядок
    // позиций не плодил новые ключи кэша.
    const pickedProductIds = [
        ...new Set(
            (watchedItems ?? [])
                .map((item) => item.product_id)
                .filter((id): id is number => id != null),
        ),
    ].sort((a, b) => a - b)
    const { data: stockRows } = useGet<ProductStock[]>(API.PRODUCT_STOCK, {
        params: { product_ids: pickedProductIds.join(",") },
        options: { enabled: pickedProductIds.length > 0 },
    })
    const stockByProduct = new Map(
        (stockRows ?? []).map((row) => [row.product_id, row]),
    )

    // Пачки: карточка даёт «Шт в пачке», план прокатки — длину трубы. Как
    // только оба числа известны, «Метров в пачке» дописывается в снимок
    // товара, и строка считается дальше сама — как будто поле было в карточке.
    const packLinesNeedLength = (watchedItems ?? []).some(
        (item) =>
            item.unit === "pack" &&
            item.product_id != null &&
            !Number(item.product?.meters_per_pack),
    )
    const pipeLengthByProduct = usePipeLengths(packLinesNeedLength)
    useEffect(() => {
        if (!pipeLengthByProduct.size) return
        form.getValues("items")?.forEach((item, index) => {
            if (item.unit !== "pack" || item.product_id == null) return
            if (Number(item.product?.meters_per_pack ?? 0) > 0) return
            const pieces = piecesPerPack(item)
            const lengthMm = pipeLengthByProduct.get(item.product_id) ?? 0
            if (pieces <= 0 || lengthMm <= 0) return
            form.setValue(`items.${index}.product`, {
                ...item.product,
                meters_per_pack: (pieces * lengthMm) / 1000,
            })
        })
    }, [pipeLengthByProduct, watchedItems, form])

    // «Резерв» of the document — the same switch as in МойСклад: the goods of
    // this order are promised to the client, so they stop being available for
    // other orders while staying on the warehouse until the shipment. Ticking
    // it reserves every filled position in full, unticking releases them; a
    // single line can still be reserved partly in its own «Резерв» column.
    const filledItems = (watchedItems ?? []).filter(
        (item) => item.product_id != null && Number(item.quantity ?? 0) > 0,
    )
    const allReserved =
        filledItems.length > 0 &&
        filledItems.every(
            (item) => Number(item.reserve ?? 0) >= Number(item.quantity ?? 0),
        )
    const toggleReserveAll = (checked: boolean) => {
        ;(watchedItems ?? []).forEach((item, index) => {
            const reserve =
                checked && item.product_id != null ?
                    Number(item.quantity ?? 0)
                :   0
            form.setValue(`items.${index}.reserve`, reserve, {
                shouldDirty: true,
            })
        })
    }

    // Picking a client fills the delivery address from their card; typing over
    // it afterwards is kept — only a new pick (or an empty field) refills it.
    const clientId = values.client_id
    const prevClient = useRef<number | null | undefined>(undefined)
    useEffect(() => {
        const changed =
            prevClient.current !== undefined && prevClient.current !== clientId
        prevClient.current = clientId
        const client = clientList.find((c) => c.id === clientId)
        if (!client) return
        if (!changed && form.getValues("shipment_address")) return
        form.setValue("shipment_address", clientAddress(client))
    }, [clientId, clientList, form])

    const onSuccess = () => {
        invalidateByExactMatch([API.ORDERS.INDEX])
        if (order) {
            // The detail query is keyed by its own url, not by the list url.
            invalidateByExactMatch([
                API.ORDERS.ID.INDEX.replace("{id}", String(order.id)),
            ])
        }
        closeModal()
        toast.success(
            order ?
                t("common.updatedSuccessfully")
            :   t("common.addedSuccessfully"),
        )
    }

    const onSubmit = form.handleSubmit((vals) => {
        const payload = {
            ...vals,
            items: vals.items
                .filter((item) => item.product_id != null)
                .map((item) => {
                    // `product` is only carried for the in-form maths; the
                    // derived price and weight mode are stored with the line.
                    const { product: _product, ...rest } = item
                    return {
                        ...rest,
                        weight_mode: weightMode(item),
                        price: unitPrice(item),
                    }
                }),
        }
        if (order) {
            patch(
                API.ORDERS.ID.INDEX.replace("{id}", String(order.id)),
                payload,
                { onSuccess },
            )
        } else {
            post(API.ORDERS.INDEX, payload, { onSuccess })
        }
    })

    return (
        <form
            onSubmit={onSubmit}
            className="flex min-h-full flex-col gap-4 pr-1"
        >
            {/* Шапка и кнопки сохранения прилипают к краям окна: документ
                длинный, и до моей правки, дойдя до файлов, приходилось
                прокручивать обратно наверх — просто чтобы увидеть «Добавить».
                Отрицательные отступы гасят паддинги модалки, чтобы полоса шла
                во всю ширину. */}
            <div className="sticky top-0 z-20 -mx-4 -mt-4 flex flex-wrap items-center justify-between gap-3 border-b bg-background px-4 pt-4 pr-12 pb-3 md:-mx-6 md:px-6 md:pr-14">
                <CardTitle className="text-base">
                    {order ?
                        `${t("common.editEntity", { entity: t("entity.order") })} — ${order.number}`
                    :   t("common.addEntity", { entity: t("entity.order") })}
                </CardTitle>

                {/* Same actions as on the detail screen — a new order has
                    nothing to print or ship yet, so they wait for the save. */}
                <div className="flex items-center gap-2 [&_button]:h-8 [&_button]:text-xs">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={!order}
                        title={!order ? t("common.saveFirst") : undefined}
                        onClick={() => printModal.openModal()}
                    >
                        <PrinterIcon className="w-4 h-4" />
                        {t("print.appendix")}
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        disabled={!order}
                        title={!order ? t("common.saveFirst") : undefined}
                        onClick={() => createDemandModal.openModal()}
                    >
                        <TruckIcon className="w-4 h-4" />
                        {t("common.createDemand")}
                    </Button>
                </div>
            </div>

            {/* Document fields — one compact block across the top */}
            <Section
                title={t("common.orderDetails")}
                bodyClassName="flex flex-col gap-3 p-4"
            >
                {/* Сетка документа — ровно четыре колонки, и каждая строка
                    заполнена до края: клиент → оплата → валюта → курс, дата →
                    договор → лот → склад, адрес (и статус) — во всю ширину.
                    Ячейка это подпись над полем одной высоты, подписи держат
                    две строки, поэтому длинная («Планируемая дата отгрузки») не
                    сдвигает соседей. Шрифт мельче обычного: документ длинный, и
                    так он читается одним экраном. */}
                <div className="grid grid-cols-1 items-end gap-x-4 gap-y-3 text-xs sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0 [&_button]:h-8 [&_button]:text-xs [&_input]:h-8 [&_input]:text-xs [&_fieldset>label]:flex [&_fieldset>label]:min-h-8 [&_fieldset>label]:items-end [&_fieldset>label]:text-xs [&_fieldset>label]:leading-tight">
                    {/* Ряд 1 — кто, чем и по какому курсу платит */}
                    <div className="flex items-end gap-1.5">
                        <SelectField
                            methods={form}
                            classNames={DENSE_SELECT}
                            name="client_id"
                            options={clientOptions}
                            label={t("table.client")}
                            wrapperClassName="min-w-0 flex-1"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-8 shrink-0"
                            title={t("common.addEntity", {
                                entity: t("entity.client"),
                            })}
                            onClick={openClientModal}
                        >
                            <PlusIcon className="h-4 w-4" />
                        </Button>
                    </div>
                    <SelectField
                        methods={form}
                        classNames={DENSE_SELECT}
                        name="payment_type_id"
                        options={paymentTypeOptions}
                        label={t("table.paymentType")}
                    />
                    <SelectField
                        methods={form}
                        classNames={DENSE_SELECT}
                        name="currency_id"
                        options={currencyOptions}
                        label={t("table.currency")}
                    />
                    <CurrencyRateField
                        methods={form}
                        currencyList={currencyList}
                    />

                    {/* Ряд 2 — когда, по какому документу и с какого склада */}
                    <DatepickerField
                        methods={form}
                        name="delivery_planned_date"
                        label={t("table.plannedShipmentDate")}
                        optional
                    />
                    <UncontrolledInput
                        methods={form}
                        name="contract_number"
                        label={t("table.contractNumber")}
                        optional
                    />
                    <UncontrolledInput
                        methods={form}
                        name="lot_number"
                        label={t("table.lotNumber")}
                        optional
                    />
                    <PaginatedSelectField<OrderForm, ReadyProduct>
                        methods={form}
                        name="warehouse_id"
                        url={API.MANUFACTURES.READY_PRODUCTS}
                        mapOption={(rp) => ({
                            id: rp.id,
                            name: readyProductLabel(rp),
                        })}
                        label={t("table.warehouse")}
                        optional
                        selectedOption={
                            order?.warehouse ?
                                {
                                    id: order.warehouse.id,
                                    name: order.warehouse.name,
                                }
                            :   null
                        }
                    />

                    {/* Ряд 3 — длинный адрес на три колонки, статус на
                        четвёртую. Статус виден и у нового заказа: продажи
                        часто заводят документ сразу «в работе», а не «Новый»,
                        и переоткрывать карточку ради этого не нужно. */}
                    <UncontrolledInput
                        methods={form}
                        name="shipment_address"
                        label={t("table.deliveryAddress")}
                        optional
                        wrapperClassName="sm:col-span-2 lg:col-span-3"
                    />
                    <SelectField
                        methods={form}
                        classNames={DENSE_SELECT}
                        name="status"
                        options={statusOptions}
                        label={t("table.status")}
                    />
                </div>

                {/* Ряд 4 — те же четыре колонки: комментарий на две, флаги
                    документа на две, обе карточки одной высоты. */}
                <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                    <UncontrolledTextarea
                        methods={form}
                        name="description"
                        label={t("table.comment")}
                        rows={2}
                        optional
                        className="min-h-14 flex-1 text-xs"
                        wrapperClassName="sm:col-span-1 lg:col-span-2 [&_label]:text-xs"
                    />

                    {/* The document flags read as one strip, level with the
                        comment box next to them. */}
                    <div className="grid h-full grid-cols-1 items-center gap-x-6 gap-y-2 self-stretch rounded-lg border bg-muted/30 px-4 py-2.5 text-xs sm:grid-cols-2 lg:col-span-2 [&_label]:text-xs [&_label]:whitespace-nowrap">
                        <SwitchField
                            methods={form}
                            name="vat_enabled"
                            label={t("common.vatEnabled")}
                            wrapperClassName="w-auto"
                        />
                        <SwitchField
                            methods={form}
                            name="vat_included"
                            label={t("common.vatIncluded")}
                            wrapperClassName="w-auto"
                        />
                        <SwitchField
                            methods={form}
                            name="applicable"
                            label={t("table.posted")}
                            wrapperClassName="w-auto"
                        />

                        <div className="flex items-center gap-2">
                            <Switch
                                id="reserve-all"
                                checked={allReserved}
                                onCheckedChange={toggleReserveAll}
                                disabled={!filledItems.length}
                                className="h-4 w-9 [&_span]:w-3 [&_span]:h-3"
                            />
                            <Label htmlFor="reserve-all">
                                {t("table.reserved")}
                            </Label>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        aria-label={t("common.reserveHint")}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <CircleHelpIcon className="h-4 w-4" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    {t("common.reserveHint")}
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Positions — the sales spreadsheet: typed columns first, the
                calculated block (grey) after them */}
            <Section
                title={t("table.products")}
                bodyClassName="p-0"
                action={
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => append({ ...EMPTY_ITEM })}
                    >
                        <PlusIcon className="mr-1 h-3.5 w-3.5" />
                        {t("common.addProduct")}
                    </Button>
                }
            >
                {/* Одиннадцать колонок на строку: при обычном шрифте «82
                    935.244 м» ломается на три строки, а «1 000» — на две.
                    Мелкий шрифт и запас по ширине держат каждое число в одну
                    строку, а строку — в одну высоту.

                    Ширина рассчитана на семизначные числа: метры заказывают
                    миллионами («1 000 000»), а в узком поле input прокручивался
                    и показывал хвост числа — начало уезжало из виду. */}
                <div className="overflow-x-auto">
                    {/* `table-fixed`: ширины колонок берутся из шапки и не
                        зависят от содержимого. При обычной раскладке длинное
                        название трубы растягивало свою ячейку и отбирало ширину
                        у «Кол-во», «Цены» и «Суммы» — строка перестраивалась от
                        каждого выбранного товара. Теперь колонки стоят на
                        месте, а имя обрезается многоточием (целиком — в
                        подсказке и в выпадающем списке). */}
                    <table className="w-full min-w-[1560px] table-fixed border-collapse text-xs">
                        <thead>
                            {/* Column order of the sales sheet: наименование →
                                кол-во → ед. изм. → кол-во б. ед. → отгружено →
                                доступно → остаток → вес, тн → цена за вес, Т →
                                цена → сумма. */}
                            <tr className="border-b bg-muted/20 text-[11px] leading-tight text-muted-foreground [&_th]:px-2 [&_th]:py-1.5 [&_th]:font-medium [&_th]:align-bottom">
                                {/* Названия труб длинные — имени отдаём всё,
                                    что удалось отобрать у денежных колонок. */}
                                <th className="w-[19%] pl-3! text-left">
                                    {t("table.nomenclature")}
                                </th>
                                <th className="w-[9%] text-left">
                                    {t("table.qty")}
                                </th>
                                <th className="w-[7%] text-left">
                                    {t("table.unit")}
                                </th>
                                <th
                                    className={`w-[9%] text-right ${CALC} ${GROUP}`}
                                >
                                    {t("table.quantityBase")}
                                </th>
                                <th className={`w-[6%] text-right ${CALC}`}>
                                    {t("table.shipped")}
                                </th>
                                <th
                                    className={`w-[7%] text-right ${CALC}`}
                                    title={t("table.stockFromBackend")}
                                >
                                    {t("table.available")}
                                </th>
                                <th
                                    className={`w-[7%] text-right ${CALC}`}
                                    title={t("table.stockFromBackend")}
                                >
                                    {t("table.remaining")}
                                </th>
                                <th className={`w-[7%] text-right ${CALC}`}>
                                    {t("table.weightTn")}
                                </th>
                                <th className={`w-[9%] text-left ${GROUP}`}>
                                    {t("table.pricePerTon")}
                                </th>
                                <th className={`w-[9%] text-left ${GROUP}`}>
                                    {t("table.price")}
                                </th>
                                <th className={`w-[9%] text-right ${CALC}`}>
                                    {t("table.sum")}
                                </th>
                                <th className="w-8" />
                            </tr>
                        </thead>
                        <tbody className="[&_input]:h-8 [&_input]:px-2 [&_input]:text-xs [&_button]:h-8 [&_button]:text-xs [&_td]:px-2 [&_td]:py-1.5 [&_td]:align-middle">
                            {fields.map((field, index) => {
                                const item = watchedItems?.[index] ?? EMPTY_ITEM
                                const base = quantityBase(item)
                                // Строка считается по карточке товара: пачки
                                // переводятся в метры через «Метров в пачке»,
                                // а вес, цена и сумма — через вес (кг/м).
                                // Пустая карточка обнуляет ровно те колонки,
                                // которым не хватило числа, и каждая из них
                                // говорит, чего именно не хватает, — молчаливый
                                // ноль читается как «программа не считает».
                                const picked = !!item.product_id
                                const packMissing =
                                    picked &&
                                    item.unit === "pack" &&
                                    metersPerPack(item) <= 0
                                const weightMissing =
                                    picked && weightPerMeter(item) <= 0
                                // Количество введено, а в метры не перевелось:
                                // пачке не хватило «метров в пачке», тонне —
                                // веса. Ноль в «Кол-во б. ед.» — не результат.
                                const baseMissing =
                                    picked &&
                                    Number(item.quantity ?? 0) > 0 &&
                                    base <= 0
                                // Тонны знают свой вес без карточки: «Вес, тн»
                                // — это само кол-во. В метры они всё же не
                                // переводятся.
                                const weightBlocked =
                                    item.unit !== "ton" &&
                                    (weightMissing || baseMissing)
                                // Сумма — цена × кол-во б. ед.; цену продавец
                                // называет сам, так что не хватить может
                                // только количества. Ноль на его месте читался
                                // бы как посчитанный.
                                const totalBlocked =
                                    baseMissing && item.unit !== "ton"
                                const baseWarning =
                                    packMissing ? t("table.packMetersMissing")
                                    : baseMissing ? t("table.weightMissing")
                                    : null
                                // «Отгружено» is kept by the backend on the
                                // saved line — a row added here has nothing
                                // shipped yet.
                                const shipped = Number(
                                    order?.items?.find((i) => i.id === item.id)
                                        ?.shipped ?? 0,
                                )
                                const stock =
                                    item.product_id != null ?
                                        stockByProduct.get(item.product_id)
                                    :   undefined
                                return (
                                    <tr
                                        key={field.id}
                                        className="border-t align-middle"
                                    >
                                        <td className="pl-3!">
                                            <ProductFacts
                                                form={form}
                                                index={index}
                                                productId={
                                                    item.product_id ?? null
                                                }
                                                snapshot={item.product ?? null}
                                                onFilled={() =>
                                                    repriceFromPerTon(index)
                                                }
                                            />
                                            <PaginatedSelectField<
                                                OrderForm,
                                                SaleProduct
                                            >
                                                methods={form}
                                                name={`items.${index}.product_id`}
                                                url={API.EXTRA.PRODUCTS.INDEX}
                                                mapOption={(p) => ({
                                                    id: p.id,
                                                    name:
                                                        p.articul ?
                                                            `${p.name} — ${p.articul}`
                                                        :   p.name,
                                                })}
                                                onPick={(picked) => {
                                                    form.setValue(
                                                        `items.${index}.product`,
                                                        picked ?
                                                            {
                                                                theoretical_weight:
                                                                    picked.theoretical_weight,
                                                                actual_weight:
                                                                    picked.actual_weight,
                                                                theoretical_weight_used:
                                                                    picked.theoretical_weight_used,
                                                                actual_weight_used:
                                                                    picked.actual_weight_used,
                                                                meters_per_pack:
                                                                    picked.meters_per_pack,
                                                                extra_fields:
                                                                    picked.extra_fields,
                                                            }
                                                        :   null,
                                                    )
                                                    // У нового товара свой
                                                    // вес метра — цена за
                                                    // метр пересчитывается.
                                                    repriceFromPerTon(index)
                                                }}
                                                selectedOption={
                                                    (
                                                        order?.items?.[index]
                                                            ?.product
                                                    ) ?
                                                        {
                                                            id: order.items[
                                                                index
                                                            ].product.id,
                                                            name:
                                                                (
                                                                    order.items[
                                                                        index
                                                                    ].product
                                                                        .articul
                                                                ) ?
                                                                    `${order.items[index].product.name} — ${order.items[index].product.articul}`
                                                                :   order.items[
                                                                        index
                                                                    ].product
                                                                        .name,
                                                        }
                                                    :   null
                                                }
                                            />
                                        </td>
                                        <td>
                                            <NumberField
                                                methods={form}
                                                name={`items.${index}.quantity`}
                                            />
                                        </td>
                                        <td>
                                            <SelectField
                                                methods={form}
                                                classNames={DENSE_SELECT}
                                                name={`items.${index}.unit`}
                                                options={unitOptions}
                                                isClearable={false}
                                                onValueChange={(option) =>
                                                    changeUnit(
                                                        index,
                                                        item,
                                                        (option?.id ??
                                                            "meter") as SaleItemUnit,
                                                    )
                                                }
                                            />
                                        </td>
                                        {/* Calculated — never typed */}
                                        <td
                                            className={`text-right tabular-nums whitespace-nowrap ${CALC} ${GROUP}`}
                                        >
                                            {base > 0 ?
                                                `${formatNumber(base, {
                                                    decimalScale: 3,
                                                    isShowZero: true,
                                                })} ${t("common.meter")}`
                                            : baseWarning ?
                                                <Missing hint={baseWarning} />
                                            :   <span className="text-muted-foreground">
                                                    —
                                                </span>
                                            }
                                        </td>
                                        <td
                                            className={`text-right tabular-nums whitespace-nowrap ${CALC}`}
                                        >
                                            {shipped > 0 ?
                                                formatNumber(shipped, {
                                                    decimalScale: 3,
                                                })
                                            :   <span className="text-muted-foreground">
                                                    0
                                                </span>
                                            }
                                        </td>
                                        {/* «Доступно» и «Остаток» — склад
                                            готовой продукции по этому товару,
                                            в метрах. */}
                                        <td
                                            className={`text-right tabular-nums whitespace-nowrap ${CALC}`}
                                            title={t("table.stockFromBackend")}
                                        >
                                            {stock ?
                                                formatNumber(stock.available, {
                                                    decimalScale: 3,
                                                    isShowZero: true,
                                                })
                                            :   <span className="text-muted-foreground">
                                                    —
                                                </span>
                                            }
                                        </td>
                                        <td
                                            className={`text-right tabular-nums whitespace-nowrap ${CALC}`}
                                            title={t("table.stockFromBackend")}
                                        >
                                            {stock ?
                                                formatNumber(stock.remaining, {
                                                    decimalScale: 3,
                                                    isShowZero: true,
                                                })
                                            :   <span className="text-muted-foreground">
                                                    —
                                                </span>
                                            }
                                        </td>
                                        <td
                                            className={`text-right tabular-nums whitespace-nowrap ${CALC}`}
                                        >
                                            {weightBlocked ?
                                                <Missing
                                                    hint={
                                                        baseWarning ??
                                                        t("table.weightMissing")
                                                    }
                                                />
                                            :   formatNumber(weightTn(item), {
                                                    decimalScale: 3,
                                                    isShowZero: true,
                                                })
                                            }
                                        </td>

                                        <td className={GROUP}>
                                            <NumberField
                                                methods={form}
                                                name={`items.${index}.price_per_ton`}
                                                optional
                                                allowZero
                                                onValueChange={(v, info) => {
                                                    if (!typedByUser(info))
                                                        return
                                                    setPricePerTon(
                                                        index,
                                                        v.floatValue || 0,
                                                    )
                                                }}
                                            />
                                        </td>
                                        {/* Цена за метр — тоже поле ввода:
                                            прайс приходит и за тонну, и за
                                            метр, и любое из двух заполняет
                                            второе. */}
                                        <td className={GROUP}>
                                            <NumberField
                                                methods={form}
                                                name={`items.${index}.price`}
                                                optional
                                                allowZero
                                                className="text-right"
                                                onValueChange={(v, info) => {
                                                    if (!typedByUser(info))
                                                        return
                                                    setPrice(
                                                        index,
                                                        v.floatValue || 0,
                                                    )
                                                }}
                                            />
                                        </td>
                                        <td
                                            className={`text-right font-semibold tabular-nums whitespace-nowrap ${CALC}`}
                                        >
                                            {totalBlocked ?
                                                <Missing
                                                    hint={
                                                        baseWarning ??
                                                        t("table.weightMissing")
                                                    }
                                                />
                                            :   formatNumber(lineTotal(item), {
                                                    decimalScale: 2,
                                                    isShowZero: true,
                                                })
                                            }
                                        </td>
                                        <td className="text-center">
                                            {fields.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        remove(index)
                                                    }
                                                    className="rounded p-1 text-red-500 hover:bg-muted"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </Section>

            {/* Низ документа — две карточки в ряд: слева файлы, справа итоги.
                Раньше итоги жались к правому краю, а половина экрана под
                таблицей пустовала, и файлы уезжали ещё ниже отдельной
                строкой. */}
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
                <Section title={t("table.files")} bodyClassName="p-0">
                    {order ?
                        <DocumentFiles
                            listUrl={API.ORDERS.FILES.INDEX.replace(
                                "{id}",
                                String(order.id),
                            )}
                            attachUrl={API.ORDERS.FILES.POST}
                            detachUrl={API.ORDERS.FILES.DELETE}
                            documentKey="order_id"
                            documentId={order.id}
                        />
                    :   <p className="p-4 text-xs text-muted-foreground">
                            {t("common.filesAfterSave")}
                        </p>
                    }
                </Section>

                <Section
                    title={t("common.totals")}
                    bodyClassName="flex flex-col gap-1.5 p-4 text-xs [&_button]:h-8 [&_button]:text-xs [&_input]:h-8 [&_input]:text-xs [&_label]:text-xs"
                >
                    <Total
                        label={t("table.subtotal")}
                        value={totals.subtotal}
                    />
                    <Total
                        label={t("table.vatIncludedSum")}
                        value={totals.vat}
                    />
                    <Total
                        label={t("table.shipmentWeight")}
                        value={totals.weight}
                        scale={3}
                    />

                    <div className="flex items-end gap-2 pt-1">
                        <NumberField
                            methods={form}
                            name="delivery_cost"
                            label={t("table.delivery")}
                            optional
                            allowZero
                            wrapperClassName="max-w-[140px]"
                        />
                        <SelectField
                            methods={form}
                            classNames={DENSE_SELECT}
                            name="delivery_mode"
                            options={deliveryModeOptions}
                            isClearable={false}
                            optional
                        />
                    </div>

                    <Total
                        label={t("table.grandTotal")}
                        value={totals.grandTotal}
                        strong
                    />
                </Section>
            </div>

            <div className="sticky bottom-0 z-20 -mx-4 -mb-4 mt-auto border-t bg-background px-4 py-3 md:-mx-6 md:px-6">
                <FormAction
                    submitName={order ? t("common.save") : t("common.add")}
                    loading={isPending}
                    className="mt-0 ml-auto w-full max-w-md"
                />
            </div>

            {/* Opens over the order (its own key, so the order stays put) and
                the saved client lands in the field right away. */}
            <ClientAddEditModal
                modalKey={ORDER_CLIENT_MODAL}
                onCreated={(created) =>
                    form.setValue("client_id", created.id, {
                        shouldDirty: true,
                    })
                }
            />
        </form>
    )
}
