import Modal from "@/components/custom/modal"
import DocumentFiles from "@/components/files/document-files"
import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"
import { useGet } from "@/hooks/react-query/use-get"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { formatNumber, round3 } from "@/lib/utils/format-number"
import { PrinterIcon, TruckIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useOrderStore } from "../-hooks/use-order-store"
import type { Order, ProductStock } from "../-types"
import { unitKey } from "./item-math"
import { ORDER_PRINT_MODAL } from "./order-print-modal"
import OrderStatusBadge from "./order-status-badge"

const money = (val: string | number | null | undefined) =>
    formatNumber(val, { decimalScale: 2, isShowZero: true })

export default function OrderDetailModal() {
    return (
        <Modal
            modalKey="order-detail"
            title={null}
            wrapperClassname="md:w-[1000px]! md:max-w-none"
            className="min-w-[960px]!"
        >
            <OrderDetail />
        </Modal>
    )
}

function OrderDetail() {
    const { t } = useTranslation()
    const { order } = useOrderStore()
    const createDemandModal = useModal("create-demand")
    const printModal = useModal(ORDER_PRINT_MODAL)

    const { data, isLoading } = useGet<Order>(
        API.ORDERS.ID.INDEX.replace("{id}", String(order?.id ?? "")),
        { options: { enabled: !!order?.id } },
    )

    // Склад по товарам заказа — те же «Доступно» и «Остаток», что в форме.
    const productIds = [
        ...new Set((data?.items ?? []).map((item) => item.product?.id)),
    ]
        .filter((id): id is number => id != null)
        .sort((a, b) => a - b)
    const { data: stockRows } = useGet<ProductStock[]>(API.PRODUCT_STOCK, {
        params: { product_ids: productIds.join(",") },
        options: { enabled: productIds.length > 0 },
    })
    const stockByProduct = new Map(
        (stockRows ?? []).map((row) => [row.product_id, row]),
    )

    if (!order) return null
    if (isLoading)
        return (
            <div className="py-8 text-center text-sm text-muted-foreground">
                {t("common.loading")}
            </div>
        )
    if (!data) return null

    const remaining = data.items.reduce(
        (acc, item) =>
            acc + (Number(item.quantity) - Number(item.shipped) > 0 ? 1 : 0),
        0,
    )

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4">
                <CardTitle>
                    {t("entity.order")} №{data.number}
                </CardTitle>
                <div className="flex items-center gap-3">
                    <OrderStatusBadge status={data.status} />
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => printModal.openModal()}
                    >
                        <PrinterIcon className="w-4 h-4" />
                        {t("print.appendix")}
                    </Button>
                    <Button
                        size="sm"
                        disabled={!remaining}
                        onClick={() => createDemandModal.openModal()}
                    >
                        <TruckIcon className="w-4 h-4" />
                        {remaining ?
                            t("common.createDemand")
                        :   t("common.nothingToShip")}
                    </Button>
                </div>
            </div>

            {/* Итоговый блок продажного листа: промежуточный итог → НДС →
                вес отгрузки → доставка → итого. */}
            <Section title={t("table.sum")}>
                <div className="grid grid-cols-5 divide-x">
                    <Cell
                        label={t("table.subtotal")}
                        value={`${money(data.total_sum)} ${data.currency?.currency ?? ""}`}
                    />
                    <Cell
                        label={t("table.vatIncludedSum")}
                        value={money(data.vat_sum)}
                    />
                    <Cell
                        label={t("table.shipmentWeight")}
                        value={round3(data.weight_sum, "0")}
                    />
                    <Cell
                        label={t("table.delivery")}
                        value={money(data.delivery_cost)}
                    />
                    <Cell
                        label={t("table.grandTotal")}
                        value={money(data.grand_total)}
                    />
                </div>
            </Section>

            <Section title={t("entity.order")}>
                <div className="grid grid-cols-3 divide-x divide-y">
                    <Cell
                        label={t("table.client")}
                        value={data.client?.full_name}
                    />
                    <Cell
                        label={t("table.paymentType")}
                        value={data.payment_type}
                    />
                    <Cell
                        label={t("table.currency")}
                        value={
                            data.currency ?
                                `${data.currency.currency} (${data.currency.current_rate})`
                            :   null
                        }
                    />
                    <Cell
                        label={t("table.clientRate")}
                        value={data.client_currency}
                    />
                    <Cell
                        label={t("table.date")}
                        value={data.doc_date?.slice(0, 10)}
                    />
                    <Cell
                        label={t("table.plannedShipmentDate")}
                        value={data.delivery_planned_date}
                    />
                    <Cell
                        label={t("table.deliveryAddress")}
                        value={data.shipment_address}
                    />
                    <Cell
                        label={t("table.contractNumber")}
                        value={data.contract_number}
                    />
                    <Cell
                        label={t("table.lotNumber")}
                        value={data.lot_number}
                    />
                    <Cell
                        label={t("table.warehouse")}
                        value={data.warehouse?.name}
                    />
                    <Cell
                        label={t("table.owner")}
                        value={
                            data.owner ?
                                `${data.owner.first_name} ${data.owner.last_name}`.trim()
                            :   null
                        }
                    />
                    <Cell
                        label={t("table.posted")}
                        value={
                            data.applicable ? t("common.yes") : t("common.no")
                        }
                    />
                    <Cell
                        label={t("table.shippedAmount")}
                        value={money(data.shipped_sum)}
                    />
                    <Cell
                        label={t("table.reserved")}
                        value={money(data.reserved_sum)}
                    />
                    <Cell label={t("table.comment")} value={data.description} />
                </div>
            </Section>

            <Section title={t("table.products")}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        {/* Колонки продажного листа: наименование → кол-во →
                            ед. изм. → кол-во б. ед. → отгружено → доступно →
                            остаток → вес → цена за вес → цена → сумма. */}
                        <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                            <tr>
                                <Th>{t("table.nomenclature")}</Th>
                                <Th align="right">{t("table.qty")}</Th>
                                <Th>{t("table.unit")}</Th>
                                <Th align="right">{t("table.quantityBase")}</Th>
                                <Th align="right">{t("table.shipped")}</Th>
                                <Th align="right">{t("table.available")}</Th>
                                <Th align="right">{t("table.remaining")}</Th>
                                <Th align="right">{t("table.weightTn")}</Th>
                                <Th align="right">{t("table.pricePerTon")}</Th>
                                <Th align="right">{t("table.price")}</Th>
                                <Th align="right">{t("table.sum")}</Th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data.items.map((item) => {
                                const stock = stockByProduct.get(
                                    item.product?.id ?? -1,
                                )
                                return (
                                    <tr key={item.id}>
                                        <Td>
                                            <span className="font-medium">
                                                {item.product?.name}
                                            </span>
                                            {item.product?.articul && (
                                                <span className="text-muted-foreground">
                                                    {" "}
                                                    · {item.product.articul}
                                                </span>
                                            )}
                                        </Td>
                                        <Td align="right">
                                            {round3(item.quantity)}
                                        </Td>
                                        <Td>{t(unitKey(item.unit))}</Td>
                                        <Td align="right">
                                            {round3(item.quantity_base)}
                                        </Td>
                                        <Td align="right">
                                            {round3(item.shipped, "0")}
                                        </Td>
                                        {/* Склад готовой продукции по товару. */}
                                        <Td align="right">
                                            {round3(stock?.available)}
                                        </Td>
                                        <Td align="right">
                                            {round3(stock?.remaining)}
                                        </Td>
                                        <Td align="right">
                                            {round3(item.weight_tn, "0")}
                                        </Td>
                                        <Td align="right">
                                            {money(item.price_per_ton)}
                                        </Td>
                                        <Td align="right">
                                            {round3(
                                                item.unit_price ?? item.price,
                                            )}
                                        </Td>
                                        <Td align="right">
                                            {money(item.line_total)}
                                        </Td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </Section>

            <Section title={t("table.files")}>
                <DocumentFiles
                    listUrl={API.ORDERS.FILES.INDEX.replace(
                        "{id}",
                        String(data.id),
                    )}
                    attachUrl={API.ORDERS.FILES.POST}
                    detachUrl={API.ORDERS.FILES.DELETE}
                    documentKey="order_id"
                    documentId={data.id}
                />
            </Section>

            <Section title={t("common.relatedDocuments")}>
                {data.demands.length ?
                    <div className="flex flex-col divide-y">
                        {data.demands.map((demand) => (
                            <div
                                key={demand.id}
                                className="flex items-center justify-between px-4 py-2 text-sm"
                            >
                                <span className="font-medium">
                                    {t("entity.demand")} №{demand.number}
                                </span>
                                <span className="text-muted-foreground">
                                    {demand.doc_date?.slice(0, 10)}
                                </span>
                                <span>{money(demand.total_sum)}</span>
                            </div>
                        ))}
                    </div>
                :   <p className="px-4 py-3 text-sm text-muted-foreground">
                        {t("common.noData")}
                    </p>
                }
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

function Th({
    children,
    align = "left",
}: {
    children: React.ReactNode
    align?: "left" | "right"
}) {
    return (
        <th className="px-3 py-2 font-semibold" style={{ textAlign: align }}>
            {children}
        </th>
    )
}

function Td({
    children,
    align = "left",
}: {
    children: React.ReactNode
    align?: "left" | "right"
}) {
    return (
        <td className="px-3 py-2" style={{ textAlign: align }}>
            {children}
        </td>
    )
}
