import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import SelectField from "@/components/form/select-field"
import UncontrolledInput from "@/components/form/uncontrolled-input"
import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { PlusIcon, Trash2 } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { useClientsQuery } from "../-hooks/use-clients-query"
import { useCurrenciesQuery } from "../-hooks/use-currencies-query"
import { useOrderStore } from "../-hooks/use-order-store"
import { usePaymentTypesQuery } from "../-hooks/use-payment-types-query"
import { useReadyProductsQuery } from "../-hooks/use-ready-products-query"
import type { OrderForm } from "../-types"

export default function OrderAddEditModal() {
    return (
        <Modal
            modalKey="add-order"
            title={null}
            wrapperClassname="md:w-[900px]! md:max-w-none"
            className="min-w-[860px]!"
        >
            <OrderAddEdit />
        </Modal>
    )
}

function OrderAddEdit() {
    const { closeModal } = useModal("add-order")
    const { invalidateByExactMatch } = useRevalidate()
    const { order } = useOrderStore()
    const { post, patch, isPending } = useRequest()

    const { clientList } = useClientsQuery()
    const { paymentTypeList } = usePaymentTypesQuery()
    const { currencyList } = useCurrenciesQuery()
    const { readyProductList } = useReadyProductsQuery()
    const statusOptions = [
        { id: "new", name: "New" },
        { id: "in_processing", name: "In Processing" },
        { id: "completed", name: "Completed" },
    ]
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

    const productOptions = readyProductList.flatMap((rp) =>
        rp.detail_items
            .filter((item) => item.product != null)
            .map((item) => ({
                id: item.product.id,
                name: `${item.product.name} — ${Number(item.product.price).toLocaleString()}`,
            })),
    )

    const form = useForm<OrderForm>({
        defaultValues: {
            client: null,
            payment_type: null,
            currency: null,
            client_currency: null,
            items: [{ product: null, price: null, count: null }],
            status: "new",
        },
        values:
            order ?
                {
                    client:
                        clientList.find((c) => c.full_name === order.client)
                            ?.id ?? null,
                    payment_type:
                        paymentTypeList.find(
                            (p) => p.name === order.payment_type,
                        )?.id ?? null,
                    currency: order.currency?.id ?? null,
                    client_currency: order.client_currency,
                    status: order.status ?? "new",
                    items:
                        order.items?.length ?
                            order.items.map((item) => ({
                                product: item.product,
                                price: item.price,
                                count: item.count,
                            }))
                        :   [{ product: null, price: null, count: null }],
                }
            :   undefined,
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    const onSuccess = () => {
        invalidateByExactMatch([API.ORDERS.INDEX])
        closeModal()
        toast.success(
            order ? "Updated successfully" : "Order added successfully",
        )
    }

    const onSubmit = form.handleSubmit((vals) => {
        if (order) {
            patch(API.ORDERS.ID.INDEX.replace("{id}", String(order.id)), vals, {
                onSuccess,
            })
        } else {
            post(API.ORDERS.INDEX, vals, { onSuccess })
        }
    })

    return (
        <form
            onSubmit={onSubmit}
            className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-1"
        >
            <CardTitle>{order ? "Edit Order" : "Add Order"}</CardTitle>

            <div className="grid grid-cols-2 gap-4">
                <SelectField
                    methods={form}
                    name="client"
                    options={clientOptions}
                    label="Client"
                    placeholder="Select client"
                />

                <SelectField
                    methods={form}
                    name="payment_type"
                    options={paymentTypeOptions}
                    label="Payment Type"
                    placeholder="Select payment type"
                />
            </div>
            <div
                className={`grid gap-4 ${order ? "grid-cols-3" : "grid-cols-2"}`}
            >
                <SelectField
                    methods={form}
                    name="currency"
                    options={currencyOptions}
                    label="Currency"
                    placeholder="Select currency"
                />

                <UncontrolledInput
                    methods={form}
                    name="client_currency"
                    label="Client Currency Rate"
                />
                {order && (
                    <SelectField
                        methods={form}
                        name="status"
                        options={statusOptions}
                        label="Status"
                        placeholder="Select status"
                    />
                )}
            </div>

            {/* Items */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Products</span>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            append({ product: null, price: null, count: null })
                        }
                    >
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Add Product
                    </Button>
                </div>

                {fields.map((field, index) => (
                    <div
                        key={field.id}
                        className="border rounded-lg p-3 flex flex-col gap-3 bg-muted/30"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                                Product #{index + 1}
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

                        <div className="grid grid-cols-3 gap-3">
                            <SelectField
                                methods={form}
                                name={`items.${index}.product`}
                                options={productOptions}
                                label="Product"
                                placeholder="Select product"
                            />

                            <UncontrolledInput
                                methods={form}
                                name={`items.${index}.price`}
                                label="Price"
                            />

                            <UncontrolledInput
                                methods={form}
                                name={`items.${index}.count`}
                                label="Count"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <FormAction
                submitName={order ? "Save" : "Add"}
                loading={isPending}
            />
        </form>
    )
}
