import Modal from "@/components/custom/modal"
import { CardTitle } from "@/components/ui/card"
import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { useManufactureStore } from "../-hooks/use-manufacture-store"
import type { DetailItem, ManufactureDetail, RawItemDetail } from "../-types"
import ManufactureStatusBadge from "./status-badge"

export default function ManufactureDetailModal() {
    return (
        <Modal
            modalKey="manufacture-detail"
            title={null}
            wrapperClassname="md:w-[1200px]! md:max-w-none"
            className="min-w-[860px]! max-w-full!"
        >
            <ManufactureDetailContent />
        </Modal>
    )
}

function ManufactureDetailContent() {
    const { manufacture } = useManufactureStore()

    const { data, isLoading } = useGet<ManufactureDetail>(
        API.MANUFACTURES.ID.replace("{id}", String(manufacture?.id ?? "")),
    )

    if (!manufacture) return null

    if (isLoading)
        return (
            <div className="py-8 text-center text-sm text-muted-foreground">
                Loading...
            </div>
        )
    if (!data) return null

    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <CardTitle>Manufacture #{data.id}</CardTitle>
                <ManufactureStatusBadge status={data.status} />
            </div>

            <Section title="General">
                <div className="flex flex-col divide-y">
                    <div className="grid grid-cols-3 divide-x">
                        <Cell label="Thickness" value={data.thickness} />
                        <Cell label="Width" value={data.width} />
                        <Cell
                            label="Created at"
                            value={new Date(data.created_at).toLocaleString()}
                        />
                    </div>
                    <div className="grid grid-cols-5 divide-x">
                        <Cell
                            label="Count Raw Material"
                            value={data.count_raw}
                        />
                        <Cell label="Total Netto" value={data.total_netto} />
                        <Cell label="Total Sum" value={data.total_sum} />
                        <Cell
                            label="Total Cut Weight"
                            value={data.total_cut_weight.toFixed(2)}
                        />
                        <Cell label="Otxod" value={data.left_over} />
                    </div>
                </div>
            </Section>

            {/* Raw Item Details */}
            {data.raw_item_details?.length > 0 && (
                <Section title="Raw Item Details">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="border-b bg-muted/40">
                                    {[
                                        "Reference",
                                        "Status",
                                        "Brutto",
                                        "Netto",

                                        "Plank",
                                        "Wagon",
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.raw_item_details.map(
                                    (raw: RawItemDetail) => (
                                        <tr
                                            key={raw.id}
                                            className="border-b last:border-0 hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-2">
                                                {raw.reference_number ?? "—"}
                                            </td>
                                            <td className="px-4 py-2">
                                                {raw.status ?? "—"}
                                            </td>
                                            <td className="px-4 py-2">
                                                {raw.brutto ?? "—"}
                                            </td>
                                            <td className="px-4 py-2">
                                                {raw.netto ?? "—"}
                                            </td>

                                            <td className="px-4 py-2">
                                                {raw.plank ?? "—"}
                                            </td>
                                            <td className="px-4 py-2">
                                                {raw.wagon ?? "—"}
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>
                </Section>
            )}

            {/* Detail Items */}
            {data.detail_items?.length > 0 && (
                <Section title="Products">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="border-b bg-muted/40">
                                    {[
                                        "Product",
                                        "Code",
                                        "SKU",
                                        "Strip Width Theoretical",
                                        "Strip Cut Width (mm)",
                                        "Qty in Cut",
                                        "Total Amount",
                                        "Weight from Cut",
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.detail_items.map((item: DetailItem) => (
                                    <tr
                                        key={item.id}
                                        className="border-b last:border-0 hover:bg-muted/30"
                                    >
                                        <td
                                            className="px-4 py-2 max-w-[240px]"
                                            title={item.product.name}
                                        >
                                            <span className="block truncate">
                                                {item.product.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            {item.product.code ?? "—"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {item.product.articul ?? "—"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {item.strip_width_theoretical}
                                        </td>
                                        <td className="px-4 py-2">
                                            {item.strip_cut_width_mm}
                                        </td>
                                        <td className="px-4 py-2">
                                            {item.quantity_in_cut}
                                        </td>
                                        <td className="px-4 py-2">
                                            {item.total_amount}
                                        </td>
                                        <td className="px-4 py-2">
                                            {item.weight_from_cut}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Section>
            )}
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
