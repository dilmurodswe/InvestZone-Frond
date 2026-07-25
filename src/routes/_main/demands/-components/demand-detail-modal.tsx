import Modal from "@/components/custom/modal"
import DocumentFiles from "@/components/files/document-files"
import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"
import { useGet } from "@/hooks/react-query/use-get"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { formatNumber, round3 } from "@/lib/utils/format-number"
import { PrinterIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useDemandStore } from "../-hooks/use-demand-store"
import type { Demand } from "../-types"
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
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => printModal.openModal()}
                >
                    <PrinterIcon className="w-4 h-4" />
                    {t("print.appendix")}
                </Button>
            </div>

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
                        label={t("table.sum")}
                        value={money(data.total_with_vat)}
                    />
                    <Cell
                        label={t("table.posted")}
                        value={data.applicable ? t("common.yes") : t("common.no")}
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
                    <Cell
                        label={t("table.vatSum")}
                        value={money(data.vat_sum)}
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
                    <Cell label={t("table.cargoName")} value={data.cargo_name} />
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
                        <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                            <tr>
                                <Th>#</Th>
                                <Th>{t("table.productName")}</Th>
                                <Th>{t("table.unit")}</Th>
                                <Th align="right">{t("table.price")}</Th>
                                <Th align="right">{t("table.quantity")}</Th>
                                <Th align="right">{t("table.discount")}</Th>
                                <Th align="right">{t("table.vatPercent")}</Th>
                                <Th align="right">{t("table.lineTotal")}</Th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data.items.map((item, i) => (
                                <tr key={item.id}>
                                    <Td>{i + 1}</Td>
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
                                    <Td>{item.product?.unit || "—"}</Td>
                                    <Td align="right">{money(item.price)}</Td>
                                    <Td align="right">
                                        {round3(item.quantity)}
                                    </Td>
                                    <Td align="right">
                                        {round3(item.discount, "0")}%
                                    </Td>
                                    <Td align="right">
                                        {round3(item.vat, "0")}%
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
