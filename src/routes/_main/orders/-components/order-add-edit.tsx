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
import ClientAddEditModal from "@/routes/_main/clients/-components/client-add-edit"
import { useClientStore } from "@/routes/_main/clients/-hooks/use-client-store"
import type { ReadyProduct } from "@/routes/_main/ready-products/-types"
import { format } from "date-fns"
import {
    CircleHelpIcon,
    PlusIcon,
    PrinterIcon,
    Trash2,
    TruckIcon,
} from "lucide-react"
import { useEffect, useRef } from "react"
import {
    useFieldArray,
    useForm,
    useWatch,
    type UseFormReturn,
} from "react-hook-form"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { useOrderStore } from "../-hooks/use-order-store"
import type {
    OrderForm,
    OrderItemForm,
    ProductStock,
    SaleClient,
    SaleProduct,
} from "../-types"
import CurrencyRateField from "./currency-rate-field"
import {
    lineTotal,
    orderTotals,
    quantityBase,
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
}: {
    form: UseFormReturn<OrderForm>
    index: number
    productId: number | null
    snapshot: OrderItemForm["product"]
}) {
    const incomplete =
        !!productId &&
        (snapshot?.theoretical_weight_used == null ||
            snapshot?.actual_weight_used == null ||
            snapshot?.meters_per_pack == null)

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
        })
        // `incomplete` is what triggered the fetch — reacting to it as well
        // would rewrite the snapshot on every keystroke.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, index, form])

    return null
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
            className={`flex justify-between gap-4 ${strong ? "border-t pt-2 text-base font-semibold" : ""}`}
        >
            <span className={strong ? "" : "text-muted-foreground"}>
                {label}:
            </span>
            <span className="tabular-nums">
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
            closeButtonClassName="top-3! right-3! text-foreground rounded-md p-1 hover:bg-muted"
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
            className="flex flex-col gap-4 min-h-full pr-1"
        >
            <div className="flex flex-wrap items-center justify-between gap-3 pr-10 shrink-0">
                <CardTitle>
                    {order ?
                        `${t("common.editEntity", { entity: t("entity.order") })} — ${order.number}`
                    :   t("common.addEntity", { entity: t("entity.order") })}
                </CardTitle>

                {/* Same actions as on the detail screen — a new order has
                    nothing to print or ship yet, so they wait for the save. */}
                <div className="flex items-center gap-2">
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
            <div className="flex flex-col gap-3 border-b pb-4">
                {/* Every cell is a label over a control of the same height, and
                    the labels reserve two lines — so however long a caption is,
                    the whole block stays on two straight rows. */}
                <div className="grid grid-cols-2 items-end gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 [&_button]:h-9 [&_input]:h-9 [&_label]:flex [&_label]:min-h-9 [&_label]:items-end [&_label]:text-sm [&_label]:leading-tight">
                    <div className="flex items-end gap-1.5">
                        <SelectField
                            methods={form}
                            name="client_id"
                            options={clientOptions}
                            label={t("table.client")}
                            wrapperClassName="min-w-0 flex-1"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="shrink-0"
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
                        name="payment_type_id"
                        options={paymentTypeOptions}
                        label={t("table.paymentType")}
                    />
                    <SelectField
                        methods={form}
                        name="currency_id"
                        options={currencyOptions}
                        label={t("table.currency")}
                    />
                    <CurrencyRateField
                        methods={form}
                        currencyList={currencyList}
                    />
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
                    {/* The address is a long line — it gets the room of two
                        (three on a wide screen) ordinary fields. */}
                    <UncontrolledInput
                        methods={form}
                        name="shipment_address"
                        label={t("table.deliveryAddress")}
                        optional
                        wrapperClassName="col-span-2 lg:col-span-2 xl:col-span-3"
                    />
                    {order && (
                        <SelectField
                            methods={form}
                            name="status"
                            options={statusOptions}
                            label={t("table.status")}
                        />
                    )}
                </div>

                <div className="grid gap-x-4 gap-y-3 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
                    <UncontrolledTextarea
                        methods={form}
                        name="description"
                        label={t("table.comment")}
                        rows={2}
                        optional
                        className="h-16 min-h-0 text-sm"
                    />

                    {/* The document flags read as one strip, level with the
                        comment box next to them. */}
                    <div className="flex h-full flex-wrap items-center gap-x-8 gap-y-3 rounded-lg border bg-muted/30 px-4 py-3 [&_label]:whitespace-nowrap">
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
            </div>

            {/* Positions — the sales spreadsheet: typed columns first, the
                calculated block (grey) after them */}
            <div className="flex flex-col gap-3">
                <span className="text-sm font-semibold">
                    {t("table.products")}
                </span>

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full min-w-[1180px] border-collapse text-sm">
                        <thead>
                            {/* Column order of the sales sheet: наименование →
                                кол-во → ед. изм. → кол-во б. ед. → отгружено →
                                доступно → остаток → вес, тн → цена за вес, Т →
                                цена → сумма. */}
                            <tr className="border-b bg-muted/20 text-xs text-muted-foreground [&_th]:px-2 [&_th]:py-2 [&_th]:font-medium [&_th]:align-bottom">
                                <th className="w-[22%] pl-3! text-left">
                                    {t("table.nomenclature")}
                                </th>
                                <th className="w-[8%] text-left">
                                    {t("table.qty")}
                                </th>
                                <th className="w-[9%] text-left">
                                    {t("table.unit")}
                                </th>
                                <th
                                    className={`w-[9%] text-right ${CALC} ${GROUP}`}
                                >
                                    {t("table.quantityBase")}
                                </th>
                                <th className={`w-[7%] text-right ${CALC}`}>
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
                                <th className={`w-[10%] text-left ${GROUP}`}>
                                    {t("table.pricePerTon")}
                                </th>
                                <th
                                    className={`w-[7%] text-right ${CALC} ${GROUP}`}
                                >
                                    {t("table.price")}
                                </th>
                                <th className={`w-[8%] text-right ${CALC}`}>
                                    {t("table.sum")}
                                </th>
                                <th className="w-10" />
                            </tr>
                        </thead>
                        <tbody className="[&_input]:h-9 [&_button]:h-9 [&_td]:px-2 [&_td]:py-2 [&_td]:align-middle">
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
                                    !Number(item.product?.meters_per_pack)
                                const weightMissing =
                                    picked && weightPerMeter(item) <= 0
                                // Тонны знают свой вес и цену без карточки:
                                // «Вес, тн» — это само кол-во, а «Цена» —
                                // цена за тонну. В метры они всё же не
                                // переводятся.
                                const moneyBlocked =
                                    weightMissing && item.unit !== "ton"
                                const baseWarning =
                                    packMissing ? t("table.packMetersMissing")
                                    : weightMissing && item.unit !== "meter" ?
                                        t("table.weightMissing")
                                    :   null
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
                                                onPick={(picked) =>
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
                                                            }
                                                        :   null,
                                                    )
                                                }
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
                                                name={`items.${index}.unit`}
                                                options={unitOptions}
                                                isClearable={false}
                                                onValueChange={(option) =>
                                                    form.setValue(
                                                        `items.${index}.weight_mode`,
                                                        option?.id === "ton" ?
                                                            "actual"
                                                        :   "theoretical",
                                                    )
                                                }
                                            />
                                        </td>
                                        {/* Calculated — never typed */}
                                        <td
                                            className={`text-right tabular-nums ${CALC} ${GROUP}`}
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
                                            className={`text-right tabular-nums ${CALC}`}
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
                                            className={`text-right tabular-nums ${CALC}`}
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
                                            className={`text-right tabular-nums ${CALC}`}
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
                                            className={`text-right tabular-nums ${CALC}`}
                                        >
                                            {moneyBlocked ?
                                                <Missing
                                                    hint={t(
                                                        "table.weightMissing",
                                                    )}
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
                                            />
                                        </td>
                                        <td
                                            className={`text-right tabular-nums ${CALC} ${GROUP}`}
                                        >
                                            {moneyBlocked ?
                                                <Missing
                                                    hint={t(
                                                        "table.weightMissing",
                                                    )}
                                                />
                                            :   formatNumber(unitPrice(item), {
                                                    decimalScale: 3,
                                                    isShowZero: true,
                                                })
                                            }
                                        </td>
                                        <td
                                            className={`text-right font-semibold tabular-nums ${CALC}`}
                                        >
                                            {moneyBlocked ?
                                                <Missing
                                                    hint={t(
                                                        "table.weightMissing",
                                                    )}
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

                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => append({ ...EMPTY_ITEM })}
                    >
                        <PlusIcon className="mr-1 h-3.5 w-3.5" />
                        {t("common.addProduct")}
                    </Button>

                    {/* Totals block */}
                    <div className="w-full max-w-sm flex flex-col gap-2 rounded-lg border bg-muted/30 p-4 text-sm">
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
                    </div>
                </div>
            </div>

            {/* Attached files — the same block as on the detail screen */}
            <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold">
                    {t("table.files")}
                </span>
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
                :   <p className="text-sm text-muted-foreground">
                        {t("common.filesAfterSave")}
                    </p>
                }
            </div>

            <FormAction
                submitName={order ? t("common.save") : t("common.add")}
                loading={isPending}
                className="mt-auto max-w-md ml-auto w-full"
            />

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
