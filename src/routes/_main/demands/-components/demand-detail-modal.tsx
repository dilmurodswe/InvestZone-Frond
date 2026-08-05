import Modal from "@/components/custom/modal"
import DocumentFiles from "@/components/files/document-files"
import PrintMenu from "@/components/print/print-menu"
import { CardTitle } from "@/components/ui/card"
import { useGet } from "@/hooks/react-query/use-get"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { demandMenuOptions } from "@/lib/print/demand-variants"
import { useDemandPrintVariant } from "@/lib/print/use-print-variant"
import { formatNumber, round3 } from "@/lib/utils/format-number"
import { useTranslation } from "react-i18next"
import { useDemandStore } from "../-hooks/use-demand-store"
import type { Demand } from "../-types"
import { unitKey } from "../../orders/-components/item-math"
import { DEMAND_PRINT_MODAL } from "./demand-print-modal"

const money = (val: string | number | null | undefined) =>
    formatNumber(val, { decimalScale: 2, isShowZero: true })

export default function DemandDetailModal() {
    return (
        <Modal
            modalKey="demand-detail"
            title={null}
            wrapperClassname="md:w-[1000px]! md:max-w-none"
            className="min-w-[960px]!"
        >
            <DemandDetail />
        </Modal>
    )
}

function DemandDetail() {
    const { t } = useTranslation()
    const { demand } = useDemandStore()
    const printModal = useModal(DEMAND_PRINT_MODAL)
    const { setVariant } = useDemandPrintVariant()

    const { data, isLoading } = useGet<Demand>(
        API.DEMANDS.ID.INDEX.replace("{id}", String(demand?.id ?? "")),
        { options: { enabled: !!demand?.id } },
    )

    if (!demand) return null
    if (isLoading)
        return (
            <div className="py-8 text-center text-sm text-muted-foreground">
                {t("common.loading")}
            </div>
        )
    if (!data) return null

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4">
                <CardTitle>
                    {t("entity.demand")} №{data.number}
                </CardTitle>
                <PrintMenu
                    options={demandMenuOptions()}
                    onPick={(variant) => {
                        setVariant(variant)
                        printModal.openModal()
                    }}
                />
            </div>

            {/* Итоговый блок продажного листа — тот же, что в заказе. */}
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

            <Section title={t("entity.demand")}>
                <div className="grid grid-cols-3 divide-x divide-y">
                    <Cell
                        label={t("table.client")}
                        value={data.client?.full_name}
                    />
                    <Cell label={t("table.order")} value={data.order_number} />
                    <Cell
                        label={t("table.date")}
                        value={data.doc_date?.slice(0, 10)}
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
                        label={t("table.posted")}
                        value={
                            data.applicable ? t("common.yes") : t("common.no")
                        }
                    />
                    <Cell
                        label={t("table.deliveryAddress")}
                        value={data.shipment_address}
                    />
                    <Cell label={t("table.comment")} value={data.description} />
                    <Cell
                        label={t("table.owner")}
                        value={
                            data.owner ?
                                `${data.owner.first_name} ${data.owner.last_name}`.trim()
                            :   null
                        }
                    />
                </div>
            </Section>

            <Section title={t("table.carrier")}>
                <div className="grid grid-cols-3 divide-x divide-y">
                    <Cell label={t("table.carrier")} value={data.carrier} />
                    <Cell
                        label={t("table.transportNumber")}
                        value={data.transport_number}
                    />
                    <Cell
                        label={t("table.cargoName")}
                        value={data.cargo_name}
                    />
                    <Cell
                        label={t("table.placesCount")}
                        value={data.places_count}
                    />
                    <Cell
                        label={t("table.waybillNumber")}
                        value={data.waybill_number}
                    />
                    <Cell
                        label={t("table.waybillDate")}
                        value={data.waybill_date}
                    />
                </div>
            </Section>

            <Section title={t("table.files")}>
                <DocumentFiles
                    listUrl={API.DEMANDS.FILES.INDEX.replace(
                        "{id}",
                        String(data.id),
                    )}
                    attachUrl={API.DEMANDS.FILES.POST}
                    detachUrl={API.DEMANDS.FILES.DELETE}
                    documentKey="demand_id"
                    documentId={data.id}
                />
            </Section>

            <Section title={t("table.products")}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        {/* Те же колонки продажного листа, что и в заказе —
                            отгрузка наследует всю расчётную часть строки. */}
                        <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                            <tr>
                                <Th>{t("table.nomenclature")}</Th>
                                <Th align="right">{t("table.qty")}</Th>
                                <Th>{t("table.unit")}</Th>
                                <Th align="right">{t("table.quantityBase")}</Th>
                                <Th align="right">{t("table.weightTn")}</Th>
                                <Th align="right">{t("table.pricePerTon")}</Th>
                                <Th align="right">{t("table.price")}</Th>
                                <Th align="right">{t("table.sum")}</Th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data.items.map((item) => (
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
                                        {round3(item.weight_tn, "0")}
                                    </Td>
                                    <Td align="right">
                                        {money(item.price_per_ton)}
                                    </Td>
                                    <Td align="right">
                                        {round3(item.unit_price ?? item.price)}
                                    </Td>
                                    <Td align="right">
                                        {money(item.line_total)}
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
