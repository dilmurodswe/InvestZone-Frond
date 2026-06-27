import Modal from "@/components/custom/modal"
import { CardTitle } from "@/components/ui/card"
import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { useTranslation } from "react-i18next"
import { useOrderStore } from "../-hooks/use-order-store"
import type { OrderDetail, OrderItemDetail, RawItemDetail } from "../-types"
import OrderStatusBadge from "./order-status-badge"

export default function OrderDetailModal() {
    return (
        <Modal
            modalKey="order-detail"
            title={null}
            wrapperClassname="md:w-[900px]! md:max-w-none"
            className="min-w-[860px]!"
        >
            <OrderDetail />
        </Modal>
    )
}

function OrderDetail() {
    const { t } = useTranslation()
    const { order } = useOrderStore()

    const { data, isLoading } = useGet<OrderDetail>(
        API.ORDERS.ID.INDEX.replace("{id}", String(order?.id ?? "")),
    )

    if (!order) return null

    if (isLoading)
        return (
            <div className="py-8 text-center text-sm text-muted-foreground">
                Loading...
            </div>
        )
    if (!data) return null

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <CardTitle>
                    {t("entity.order")} #{data.id}
                </CardTitle>
                <OrderStatusBadge status={data.status} />
            </div>

            <Section title="General">
                <div className="grid grid-cols-3 divide-x divide-y">
                    <Cell label="Client" value={data.client} />
                    <Cell label="Payment Type" value={data.payment_type} />
                    <Cell
                        label="Currency"
                        value={
                            data.currency ?
                                `${data.currency.currency} (${data.currency.current_rate})`
                            :   null
                        }
                    />
                    <Cell label="Client Rate" value={data.client_currency} />
                    <Cell label="Date" value={data.created_at} />
                </div>
            </Section>

            <Section title="Products">
                <div className="flex flex-col divide-y">
                    {data.items?.map((item: OrderItemDetail, i: number) => (
                        <div key={item.id} className="p-4 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold">
                                    #{i + 1} — {item.product?.product}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {item.product?.category} /{" "}
                                    {item.product?.sub_category}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 divide-x divide-y border rounded-lg overflow-hidden">
                                <Cell label="Price" value={item.price} />
                                <Cell label="Count" value={item.count} />
                                <Cell
                                    label="Stock"
                                    value={item.product?.stock}
                                />
                            </div>

                            {item.product?.raw_item_details?.length > 0 && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Raw Items
                                    </span>
                                    <div className="border rounded-lg overflow-hidden divide-y">
                                        {item.product.raw_item_details.map(
                                            (raw: RawItemDetail) => (
                                                <div
                                                    key={raw.id}
                                                    className="grid grid-cols-4 divide-x"
                                                >
                                                    <Cell
                                                        label="Reference"
                                                        value={
                                                            raw.reference_number
                                                        }
                                                    />
                                                    <Cell
                                                        label="Outer size"
                                                        value={raw.outer_size}
                                                    />
                                                    <Cell
                                                        label="Weight"
                                                        value={raw.weight}
                                                    />
                                                    <Cell
                                                        label="Mark"
                                                        value={raw.mark}
                                                    />
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Section>
        </div>
    )
}

function Section({
    title,
    children,
}: {
    title: string
    children: React.ReactNode
}) {
    return (
        <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/40 px-4 py-2 border-b">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {title}
                </p>
            </div>
            {children}
        </div>
    )
}

function Cell({
    label,
    value,
}: {
    label: string
    value: string | number | null | undefined
}) {
    return (
        <div className="flex flex-col gap-0.5 px-4 py-3">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-sm font-medium break-words">
                {value != null && value !== "" ?
                    String(value)
                :   <span className="text-muted-foreground font-normal">—</span>
                }
            </span>
        </div>
    )
}
