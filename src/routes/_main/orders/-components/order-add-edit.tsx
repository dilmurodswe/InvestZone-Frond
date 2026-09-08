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
import PrintMenu from "@/components/print/print-menu"
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
import { printMenuOptions } from "@/lib/print/appendix-variants"
import { usePrintVariant } from "@/lib/print/use-print-variant"
import { contentAreaElement } from "@/lib/utils/content-area"
import { formatNumber } from "@/lib/utils/format-number"
import { cn } from "@/lib/utils/shadcn"
import ClientAddEditModal from "@/routes/_main/clients/-components/client-add-edit"
import { toCurrencyCode } from "@/routes/_main/clients/-components/client-balance-utils"
import { ClientBalanceChip } from "@/routes/_main/clients/-components/client-balances"
import { useClientStore } from "@/routes/_main/clients/-hooks/use-client-store"
import type { ReadyProduct } from "@/routes/_main/ready-products/-types"
import type { RollingPlan } from "@/routes/_main/rolling-plans/-types"
import type { PaginatedResponse } from "@/types/common"
import { format } from "date-fns"
import { CircleHelpIcon, PlusIcon, Trash2, TruckIcon } from "lucide-react"
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
 * (наименование, кол-во, ед. изм., обе цены) and everything the sheet derives
 * sits on a tint (сумма — и вся нижняя полоса позиции). Позиция читается как
 * «вписал сверху → документ посчитал снизу», а не как одиннадцать равных ячеек.
 */
const CALC = "bg-muted/40"

/**
 * Сетка позиции: наименование → кол-во → ед. изм. → цена за вес, Т → цена →
 * сумма → удалить. Одна и та же и у шапки колонок, и у каждой карточки товара,
 * поэтому подписи стоят ровно над своими полями.
 */
const COLS =
    "grid grid-cols-[minmax(0,2.6fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_2rem] items-center gap-x-2"

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
 * Шапка документа набрана двумя кеглями: подпись поля — 13 px, всё, что в поле
 * вписывают (значение, плейсхолдер, выбранный пункт списка) — 12 px.
 *
 * До этого плейсхолдер брал размер у базового инпута (14–16 px) и выходил
 * крупнее собственной подписи: пустое поле кричало громче своего названия, а
 * ряд полей читался набранным вразнобой. `font-normal` у инпута — потому что
 * подпись задаётся тем же селектором, что и обёртка поля, и без него значение
 * унаследовало бы полужирный от подписи.
 */
const DOC_GRID =
    "grid grid-cols-1 gap-x-4 gap-y-3 text-xs sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0"
const DOC_TYPE = [
    // внутреннее — мельче и ровно одной высоты
    "[&_button]:h-8 [&_button]:text-xs",
    "[&_input]:h-8 [&_input]:text-xs [&_input]:font-normal [&_input]:placeholder:text-xs",
    // подпись — крупнее и контрастнее; две строки подписи («Планируемая дата
    // отгрузки») не сдвигают соседей, потому что все они одной высоты
    "[&_fieldset>label]:flex [&_fieldset>label]:min-h-8 [&_fieldset>label]:items-end",
    "[&_fieldset>label]:text-[13px] [&_fieldset>label]:leading-tight [&_fieldset>label]:font-medium [&_fieldset>label]:text-foreground",
].join(" ")

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

/**
 * Одно посчитанное число в нижней строке позиции: подпись и значение рядом.
 *
 * Строка товара набрана двумя ярусами — сверху то, что вписывают руками, снизу
 * то, что документ посчитал сам. У нижнего яруса своей шапки нет (иначе
 * таблице понадобилось бы одиннадцать колонок и горизонтальная прокрутка),
 * поэтому подпись каждое число носит с собой.
 */
function Derived({
    label,
    title,
    children,
}: {
    label: string
    title?: string
    children: ReactNode
}) {
    return (
        <div
            // Своя еле заметная ячейка у каждого числа: на сплошной подложке
            // пять пар «подпись → значение» сливались в одну строку текста, и
            // глаз не сразу понимал, какое число к какой подписи относится.
            // Рамка почти невидима — она отделяет, а не расчерчивает.
            className="flex min-w-0 items-baseline justify-between gap-2 rounded-md border border-border/50 bg-background/70 px-2 py-1"
            title={title}
        >
            <span className="truncate text-[11px] text-muted-foreground">
                {label}
            </span>
            <span className="font-medium tabular-nums whitespace-nowrap">
                {children}
            </span>
        </div>
    )
}

/** Прочерк на месте числа, которого ещё нет. */
const Dash = () => <span className="text-muted-foreground">—</span>

/**
 * Одна сумма в строке итогов: подпись сверху, число под ней. `strong` — это
 * «Итого»: отбито чертой слева и прижато к правому краю строки, чтобы взгляд
 * находил конечную сумму, не читая всю цепочку.
 */
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
            className={cn(
                "flex flex-col gap-1",
                strong && "ml-auto border-l pl-8 text-right",
            )}
        >
            <span className="text-xs text-muted-foreground">{label}</span>
            <span
                className={cn(
                    "tabular-nums whitespace-nowrap",
                    strong ? "text-sm font-semibold" : "font-medium",
                )}
            >
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
    const { setVariant: setPrintVariant } = usePrintVariant()
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
            proxy_number: "",
            revision: "",
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
                    proxy_number: order.proxy_number ?? "",
                    revision: order.revision ?? "",
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
                    <PrintMenu
                        options={printMenuOptions()}
                        disabled={!order}
                        title={!order ? t("common.saveFirst") : undefined}
                        onPick={(variant) => {
                            setPrintVariant(variant)
                            printModal.openModal()
                        }}
                    />
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
                {/* Сетка документа — ровно четыре колонки, и ни одной дыры:
                    двенадцать полей ложатся в три полных ряда по четыре.
                    Раньше «Склад» занимал две колонки, а «Адрес доставки» —
                    три, и справа от «Ревизии» оставалась пустая четверть ряда:
                    поля висели вразнобой, хотя места хватало всем.

                    Ячейка это подпись над полем одной высоты, подписи держат
                    две строки, поэтому длинная («Планируемая дата отгрузки») не
                    сдвигает соседей. */}
                <div className={cn(DOC_GRID, DOC_TYPE, "items-end")}>
                    {/* Ряд 1 — кто, чем и по какому курсу платит */}
                    <div className="flex min-w-0 flex-col gap-0.5">
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
                        {(() => {
                            const picked = clientList.find(
                                (c) => c.id === values.client_id,
                            )
                            if (!picked?.balances) return null
                            const code = toCurrencyCode(
                                currencyList.find(
                                    (c) => c.id === values.currency_id,
                                )?.currency,
                            )
                            return (
                                <ClientBalanceChip
                                    balances={picked.balances}
                                    currency={code}
                                    labels={{
                                        advance: t("client.advance"),
                                        debt: t("client.debt"),
                                        zero: t("cashFlow.balance"),
                                    }}
                                />
                            )
                        })()}
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

                    {/* Ряд 2 — срок отгрузки и бумаги сделки */}
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

                    <UncontrolledInput
                        methods={form}
                        name="proxy_number"
                        label={t("table.proxyNumber")}
                        optional
                    />

                    {/* Ряд 3 — ревизия, склад, куда везём и в каком статусе.
                        Статус виден и у нового заказа: продажи часто заводят
                        документ сразу «в работе», а не «Новый», и
                        переоткрывать карточку ради этого не нужно. */}
                    <UncontrolledInput
                        methods={form}
                        name="revision"
                        label={t("table.revision")}
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

                    <UncontrolledInput
                        methods={form}
                        name="shipment_address"
                        label={t("table.deliveryAddress")}
                        optional
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
                <div className={cn(DOC_GRID, "items-stretch")}>
                    <UncontrolledTextarea
                        methods={form}
                        name="description"
                        label={t("table.comment")}
                        rows={2}
                        optional
                        className="min-h-16 flex-1 text-xs placeholder:text-xs"
                        wrapperClassName="sm:col-span-1 lg:col-span-2 [&>label]:text-[13px] [&>label]:font-medium [&>label]:text-foreground"
                    />

                    {/* Флаги документа — четыре переключателя в две ровные
                        колонки, распределённые по высоте карточки: строка
                        читается как одна полоса вровень с комментарием, а не
                        как четыре пункта, прижатых к верхнему краю. */}
                    <div className="grid h-full grid-cols-1 content-evenly gap-x-6 gap-y-2.5 self-stretch rounded-lg border bg-muted/30 px-4 py-3 text-xs sm:grid-cols-2 lg:col-span-2 [&_label]:text-[13px] [&_label]:font-medium [&_label]:text-foreground [&_label]:whitespace-nowrap">
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
            <Section title={t("table.products")} bodyClassName="p-0">
                {/* Позиция — отдельная карточка в два яруса.

                    Одиннадцать колонок в одну строку не помещались: таблице
                    приходилось держать 1560 px и прокручиваться вбок, а «Цена»
                    и «Сумма» — те самые числа, ради которых документ и
                    заполняют, — оставались за краем экрана. Сверху карточки
                    теперь то, что вписывают руками, снизу — полоса того, что
                    документ посчитал сам.

                    Карточка, а не строка таблицы: сплошным списком строки
                    сливались, и глаз не видел, где кончается один товар и
                    начинается следующий. Рамка с отбивкой держит оба яруса
                    вместе как одну позицию. Сетка колонок у шапки и карточек
                    общая (COLS), а боковые отступы шапки равны отступу карточки
                    вместе с её рамкой, поэтому подписи стоят ровно над полями. */}
                <div className="overflow-x-auto">
                    <div className="min-w-[820px]">
                        <div
                            className={cn(
                                COLS,
                                "border-b bg-muted/20 px-[25px] py-1.5 text-[11px] leading-tight font-medium text-muted-foreground",
                            )}
                        >
                            {/* Названия труб длинные — имени отдаём всё, что
                                удалось отобрать у денежных колонок.

                                `pl-2`/`pr-2` — это внутренний отступ поля под
                                подписью: без них подпись стояла на краю
                                колонки, а значение — на восемь пикселей внутри,
                                и столбик читался съехавшим. */}
                            <span className="pl-2">
                                {t("table.nomenclature")}
                            </span>
                            <span className="pl-2">{t("table.qty")}</span>
                            <span className="pl-2">{t("table.unit")}</span>
                            <span className="pr-2 text-right">
                                {t("table.pricePerTon")}
                            </span>
                            <span className="pr-2 text-right">
                                {t("table.price")}
                            </span>
                            <span className="text-right">{t("table.sum")}</span>
                            <span />
                        </div>

                        <div className="flex flex-col gap-2 p-3 [&_button]:h-8 [&_button]:text-xs [&_input]:h-8 [&_input]:px-2 [&_input]:text-xs">
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
                                    <div
                                        key={field.id}
                                        className="rounded-lg border bg-card shadow-xs transition-colors hover:border-foreground/20"
                                    >
                                        {/* Верхний ярус — то, что вписывают */}
                                        <div className={cn(COLS, "px-3 py-2")}>
                                            <div className="min-w-0">
                                                <ProductFacts
                                                    form={form}
                                                    index={index}
                                                    productId={
                                                        item.product_id ?? null
                                                    }
                                                    snapshot={
                                                        item.product ?? null
                                                    }
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
                                                    url={
                                                        API.EXTRA.PRODUCTS.INDEX
                                                    }
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
                                                            order?.items?.[
                                                                index
                                                            ]?.product
                                                        ) ?
                                                            {
                                                                id: order.items[
                                                                    index
                                                                ].product.id,
                                                                name:
                                                                    (
                                                                        order
                                                                            .items[
                                                                            index
                                                                        ]
                                                                            .product
                                                                            .articul
                                                                    ) ?
                                                                        `${order.items[index].product.name} — ${order.items[index].product.articul}`
                                                                    :   order
                                                                            .items[
                                                                            index
                                                                        ]
                                                                            .product
                                                                            .name,
                                                            }
                                                        :   null
                                                    }
                                                />
                                            </div>
                                            <NumberField
                                                methods={form}
                                                name={`items.${index}.quantity`}
                                            />
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
                                            {/* Деньги — по правому краю: так
                                                разряды двух цен и суммы стоят
                                                друг под другом. */}
                                            <NumberField
                                                methods={form}
                                                name={`items.${index}.price_per_ton`}
                                                optional
                                                allowZero
                                                className="text-right"
                                                onValueChange={(v, info) => {
                                                    if (!typedByUser(info))
                                                        return
                                                    setPricePerTon(
                                                        index,
                                                        v.floatValue || 0,
                                                    )
                                                }}
                                            />
                                            {/* Цена за метр — тоже поле ввода:
                                                прайс приходит и за тонну, и за
                                                метр, и любое из двух заполняет
                                                второе. */}
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
                                            <div className="text-right font-semibold tabular-nums whitespace-nowrap">
                                                {totalBlocked ?
                                                    <Missing
                                                        hint={
                                                            baseWarning ??
                                                            t(
                                                                "table.weightMissing",
                                                            )
                                                        }
                                                    />
                                                :   formatNumber(
                                                        lineTotal(item),
                                                        {
                                                            decimalScale: 2,
                                                            isShowZero: true,
                                                        },
                                                    )
                                                }
                                            </div>
                                            <div className="flex justify-center">
                                                {fields.length > 1 && (
                                                    <button
                                                        type="button"
                                                        title={t(
                                                            "common.delete",
                                                        )}
                                                        onClick={() =>
                                                            remove(index)
                                                        }
                                                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Нижний ярус — посчитанное. Он на
                                            подложке и внутри той же рамки: это
                                            продолжение позиции, а не новая. */}
                                        <div
                                            className={`grid grid-cols-2 gap-1.5 rounded-b-lg border-t p-1.5 text-[11px] sm:grid-cols-3 lg:grid-cols-5 ${CALC}`}
                                        >
                                            <Derived
                                                label={t("table.quantityBase")}
                                            >
                                                {base > 0 ?
                                                    `${formatNumber(base, {
                                                        decimalScale: 3,
                                                        isShowZero: true,
                                                    })} ${t("common.meter")}`
                                                : baseWarning ?
                                                    <Missing
                                                        hint={baseWarning}
                                                    />
                                                :   <Dash />}
                                            </Derived>
                                            <Derived label={t("table.shipped")}>
                                                {shipped > 0 ?
                                                    formatNumber(shipped, {
                                                        decimalScale: 3,
                                                    })
                                                :   <Dash />}
                                            </Derived>
                                            {/* «Доступно» и «Остаток» — склад
                                                готовой продукции по этому
                                                товару, в метрах. */}
                                            <Derived
                                                label={t("table.available")}
                                                title={t(
                                                    "table.stockFromBackend",
                                                )}
                                            >
                                                {stock ?
                                                    formatNumber(
                                                        stock.available,
                                                        {
                                                            decimalScale: 3,
                                                            isShowZero: true,
                                                        },
                                                    )
                                                :   <Dash />}
                                            </Derived>
                                            <Derived
                                                label={t("table.remaining")}
                                                title={t(
                                                    "table.stockFromBackend",
                                                )}
                                            >
                                                {stock ?
                                                    formatNumber(
                                                        stock.remaining,
                                                        {
                                                            decimalScale: 3,
                                                            isShowZero: true,
                                                        },
                                                    )
                                                :   <Dash />}
                                            </Derived>
                                            <Derived
                                                label={t("table.weightTn")}
                                            >
                                                {weightBlocked ?
                                                    <Missing
                                                        hint={
                                                            baseWarning ??
                                                            t(
                                                                "table.weightMissing",
                                                            )
                                                        }
                                                    />
                                                :   formatNumber(
                                                        weightTn(item),
                                                        {
                                                            decimalScale: 3,
                                                            isShowZero: true,
                                                        },
                                                    )
                                                }
                                            </Derived>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Кнопка под таблицей, а не в шапке блока: новую строку
                    добавляют там, где кончилась последняя — как в накладной.
                    В шапке она отрывалась от списка и на длинном документе
                    оставалась где-то вверху экрана. */}
                <div className="border-t px-3 py-2">
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
                </div>
            </Section>

            {/* Файлы — только у сохранённого заказа: прикрепить их можно
                лишь к существующему документу, и в «Добавить заказ» карточка
                была пустой рамкой с надписью «после сохранения». Теперь она
                просто не занимает место, пока прикреплять не к чему. */}
            {order && (
                <Section title={t("table.files")} bodyClassName="p-0">
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
                </Section>
            )}

            {/* Итоги — одной строкой во всю ширину под таблицей: суммы стоят
                в том же порядке, в каком считаются (подытог → НДС → вес →
                доставка), а «Итого» отбито чертой у правого края. Колонкой
                справа они занимали пол-экрана в высоту, оставляя пустое поле
                слева. */}
            <Section
                title={t("common.totals")}
                bodyClassName="flex flex-wrap items-end gap-x-8 gap-y-4 p-4 text-xs [&_button]:h-8 [&_button]:text-xs [&_input]:h-8 [&_input]:text-xs [&_label]:text-xs"
            >
                <Total label={t("table.subtotal")} value={totals.subtotal} />
                <Total label={t("table.vatIncludedSum")} value={totals.vat} />
                <Total
                    label={t("table.shipmentWeight")}
                    value={totals.weight}
                    scale={3}
                />

                <div className="flex items-end gap-2">
                    <NumberField
                        methods={form}
                        name="delivery_cost"
                        label={t("table.delivery")}
                        optional
                        allowZero
                        wrapperClassName="w-[120px]"
                    />
                    <SelectField
                        methods={form}
                        classNames={DENSE_SELECT}
                        name="delivery_mode"
                        options={deliveryModeOptions}
                        isClearable={false}
                        optional
                        wrapperClassName="w-[170px]"
                    />
                </div>

                <Total
                    label={t("table.grandTotal")}
                    value={totals.grandTotal}
                    strong
                />
            </Section>

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
