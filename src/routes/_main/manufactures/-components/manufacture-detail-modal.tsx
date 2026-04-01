import Modal from "@/components/custom/modal"
import { CardTitle } from "@/components/ui/card"
import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { useManufactureStore } from "../-hooks/use-manufacture-store"
import type { ManufactureDetail, RawItemDetail } from "../-types"
import ManufactureStatusBadge from "./status-badge"

export default function ManufactureDetailModal() {
    return (
        <Modal
            modalKey="manufacture-detail"
            title={null}
            wrapperClassname="md:w-[900px]! md:max-w-none"
            className="min-w-[860px]!"
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

            {/* General */}
            <Section title="General">
                <div className="grid grid-cols-3 divide-x divide-y">
                    <Cell label="Category" value={data.category} />
                    <Cell label="Sub Category" value={data.sub_category} />
                    <Cell label="Product" value={data.product} />
                    <Cell label="Stock" value={data.stock} />
                    <Cell
                        label="Created at"
                        value={new Date(data.created_at).toLocaleString()}
                    />
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
                                        "Weight",
                                        "Netto",
                                        "Inner",
                                        "Outer",
                                        "Standard",
                                        "Mark",
                                        "Plank",
                                        "Price",
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
                                                {raw.weight ?? "—"}
                                            </td>
                                            <td className="px-4 py-2">
                                                {raw.netto ?? "—"}
                                            </td>
                                            <td className="px-4 py-2">
                                                {raw.inner_size ?? "—"}
                                            </td>
                                            <td className="px-4 py-2">
                                                {raw.outer_size ?? "—"}
                                            </td>
                                            <td className="px-4 py-2">
                                                {raw.standard ?? "—"}
                                            </td>
                                            <td className="px-4 py-2">
                                                {raw.mark ?? "—"}
                                            </td>
                                            <td className="px-4 py-2">
                                                {raw.plank ?? "—"}
                                            </td>
                                            <td className="px-4 py-2">
                                                {raw.price ?? "—"}
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
