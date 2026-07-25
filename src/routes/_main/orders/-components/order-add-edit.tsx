import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import DatepickerField from "@/components/form/datepicker-field"
import NumberField from "@/components/form/number-field"
import PaginatedSelectField from "@/components/form/paginated-select-field"
import SelectField from "@/components/form/select-field"
import SwitchField from "@/components/form/switch-field"
import UncontrolledInput from "@/components/form/uncontrolled-input"
import UncontrolledTextarea from "@/components/form/uncontrolled-textarea"
import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import {
    useSaleClientsQuery,
    useSaleCurrenciesQuery,
    useSalePaymentTypesQuery,
} from "@/hooks/react-query/use-sale-refs"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { formatNumber } from "@/lib/utils/format-number"
import { PlusIcon, Trash2 } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import type { ReadyProduct } from "@/routes/_main/ready-products/-types"
import { useOrderStore } from "../-hooks/use-order-store"
import type { OrderForm, OrderItemForm, SaleProduct } from "../-types"
import { useOrderStatusOptions } from "./status-config"

/** Ready-product label — matches the "Ready Products" screen: `thickness x width`. */
const readyProductLabel = (rp: Pick<ReadyProduct, "id" | "thickness" | "width">) =>
    [rp.thickness, rp.width].filter(Boolean).join(" x ") || `#${rp.id}`

const EMPTY_ITEM: OrderItemForm = {
    product_id: null,
    price: null,
    quantity: null,
    discount: 0,
    vat: 0,
    reserve: 0,
}

/** price × quantity with the discount applied — mirrors OrderItem.line_total. */
const lineTotal = (item: OrderItemForm) => {
    const gross = Number(item.price || 0) * Number(item.quantity || 0)
    return gross * (1 - Number(item.discount || 0) / 100)
}

export default function OrderAddEditModal() {
    return (
        <Modal
            modalKey="add-order"
            title={null}
            wrapperClassname="md:w-[1000px]! md:max-w-none"
            className="min-w-[960px]!"
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
            doc_date: null,
            delivery_planned_date: null,
            shipment_address: "",
            description: "",
            status: "new",
            vat_enabled: false,
            vat_included: true,
            applicable: false,
            items: [{ ...EMPTY_ITEM }],
        },
        values:
            order ?
                {
                    client_id: order.client?.id ?? null,
                    payment_type_id:
                        paymentTypeList.find((p) => p.name === order.payment_type)
                            ?.id ?? null,
                    currency_id: order.currency?.id ?? null,
                    client_currency:
                        order.client_currency ?
                            Number(order.client_currency)
                        :   null,
                    contract_number: order.contract_number ?? "",
                    lot_number: order.lot_number ?? "",
                    warehouse_id: order.warehouse?.id ?? null,
                    doc_date: order.doc_date?.slice(0, 10) ?? null,
                    delivery_planned_date: order.delivery_planned_date,
                    shipment_address: order.shipment_address ?? "",
                    description: order.description ?? "",
                    status: order.status ?? "new",
                    vat_enabled: order.vat_enabled,
                    vat_included: order.vat_included,
                    applicable: order.applicable,
                    items:
                        order.items?.length ?
                            order.items.map((item) => ({
                                id: item.id,
                                product_id: item.product?.id ?? null,
                                price: Number(item.price),
                                quantity: Number(item.quantity),
                                discount: Number(item.discount),
                                vat: item.vat,
                                reserve: Number(item.reserve),
                            }))
                        :   [{ ...EMPTY_ITEM }],
                }
            :   undefined,
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    const watchedItems = form.watch("items")
    const total = (watchedItems ?? []).reduce(
        (acc, item) => acc + lineTotal(item),
        0,
    )

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
            items: vals.items.filter((item) => item.product_id != null),
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
            className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-1"
        >
            <CardTitle>
                {order ?
                    `${t("common.editEntity", { entity: t("entity.order") })} — ${order.number}`
                :   t("common.addEntity", { entity: t("entity.order") })}
            </CardTitle>

            <div className="grid grid-cols-3 gap-4">
                <SelectField
                    methods={form}
                    name="client_id"
                    options={clientOptions}
                    label={t("table.client")}
                />
                <SelectField
                    methods={form}
                    name="payment_type_id"
                    options={paymentTypeOptions}
                    label={t("table.paymentType")}
                />
                <DatepickerField
                    methods={form}
                    name="doc_date"
                    label={t("table.date")}
                    optional
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <SelectField
                    methods={form}
                    name="currency_id"
                    options={currencyOptions}
                    label={t("table.currency")}
                />
                <NumberField
                    methods={form}
                    name="client_currency"
                    label={t("table.clientRate")}
                    optional
                />
                <DatepickerField
                    methods={form}
                    name="delivery_planned_date"
                    label={t("table.plannedShipmentDate")}
                    optional
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
                <UncontrolledInput
                    methods={form}
                    name="shipment_address"
                    label={t("table.deliveryAddress")}
                    optional
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

            <UncontrolledTextarea
                methods={form}
                name="description"
                label={t("table.comment")}
                rows={2}
                optional
            />

            <div className="flex flex-wrap gap-6">
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
            </div>

            {/* Positions */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                        {t("table.products")}
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ ...EMPTY_ITEM })}
                    >
                        <PlusIcon className="w-4 h-4 mr-1" />
                        {t("common.addProduct")}
                    </Button>
                </div>

                {fields.map((field, index) => (
                    <div
                        key={field.id}
                        className="border rounded-lg p-3 flex flex-col gap-3 bg-muted/30"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                                #{index + 1} ·{" "}
                                {formatNumber(
                                    lineTotal(watchedItems?.[index] ?? EMPTY_ITEM),
                                    { decimalScale: 2, isShowZero: true },
                                )}
                            </span>
                            {fields.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="p-1 rounded hover:bg-muted text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-6 gap-3">
                            <PaginatedSelectField<OrderForm, SaleProduct>
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
                                label={t("table.productName")}
                                wrapperClassName="col-span-2"
                                selectedOption={
                                    order?.items?.[index]?.product ?
                                        {
                                            id: order.items[index].product.id,
                                            name:
                                                order.items[index].product
                                                    .articul ?
                                                    `${order.items[index].product.name} — ${order.items[index].product.articul}`
                                                :   order.items[index].product
                                                        .name,
                                        }
                                    :   null
                                }
                            />
                            <NumberField
                                methods={form}
                                name={`items.${index}.price`}
                                label={t("table.price")}
                            />
                            <NumberField
                                methods={form}
                                name={`items.${index}.quantity`}
                                label={t("table.quantity")}
                            />
                            <NumberField
                                methods={form}
                                name={`items.${index}.discount`}
                                label={t("table.discount")}
                                optional
                                allowZero
                            />
                            <NumberField
                                methods={form}
                                name={`items.${index}.reserve`}
                                label={t("table.reserved")}
                                optional
                                allowZero
                            />
                        </div>
                    </div>
                ))}

                <div className="flex justify-end text-sm font-semibold">
                    {t("table.sum")}:{" "}
                    {formatNumber(total, {
                        decimalScale: 2,
                        isShowZero: true,
                    })}
                </div>
            </div>

            <FormAction
                submitName={order ? t("common.save") : t("common.add")}
                loading={isPending}
            />
        </form>
    )
}
