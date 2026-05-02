import Modal from "@/components/custom/modal"
import { CardTitle } from "@/components/ui/card"
import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { useRollingPlanStore } from "../-hooks/use-rolling-plan-store"
import type { RollingPlanDetail, RollingPlanItem } from "../-types"
// import RollingPlanStatusBadge from "./status-badge"

export default function RollingPlanDetailModal() {
    return (
        <Modal
            modalKey="rolling-plan-detail"
            title={null}
            wrapperClassname="md:w-[1100px]! md:max-w-none"
            className="min-w-[760px]! max-w-full!"
        >
            <RollingPlanDetailContent />
        </Modal>
    )
}

function RollingPlanDetailContent() {
    const { rollingPlan } = useRollingPlanStore()

    const { data, isLoading } = useGet<RollingPlanDetail>(
        API.ROLLING_PLANS.ID.replace("{id}", String(rollingPlan?.id ?? "")),
    )

    if (!rollingPlan) return null
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
                <CardTitle>Rolling Plan #{data.id}</CardTitle>
                {/* <RollingPlanStatusBadge status={data.status} /> */}
            </div>

            <Section title="General">
                <div className="flex flex-col divide-y">
                    <div className="grid grid-cols-3 divide-x">
                        <Cell label="Plan Number" value={data.plan_number} />
                        <Cell
                            label="Machine"
                            value={data.machine_name ?? data.machine}
                        />
                        <Cell
                            label="Created at"
                            value={new Date(data.created_at).toLocaleString()}
                        />
                    </div>
                    <div className="grid grid-cols-3 divide-x">
                        <Cell
                            label="Items Count"
                            value={data.items?.length ?? 0}
                        />
                        <Cell
                            label="Total Pcs"
                            value={data.items?.reduce(
                                (s, i) => s + (i.total_pcs ?? 0),
                                0,
                            )}
                        />
                        <Cell
                            label="Total Weight"
                            value={data.items?.reduce(
                                (s, i) => s + (i.total_weight ?? 0),
                                0,
                            )}
                        />
                    </div>
                </div>
            </Section>

            {data.items?.length > 0 && (
                <Section title="Items">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="border-b bg-muted/40">
                                    {[
                                        "#",
                                        "Product",
                                        "Strip Cut Width",
                                        "Status",
                                        "Total Pcs",
                                        "Total Weight",
                                        "Selected Weight (ton)",
                                        "Calculated Meters",
                                        "Pipe Length (mm)",
                                        "End Date",
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
                                {data.items.map(
                                    (item: RollingPlanItem, idx: number) => (
                                        <tr
                                            key={item.id}
                                            className="border-b last:border-0 hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-2 text-muted-foreground">
                                                {idx + 1}
                                            </td>
                                            <td className="px-4 py-2">
                                                {item.product_name ?? "—"}
                                            </td>
                                            <td className="px-4 py-2">
                                                {item.strip_cut_width_mm ?? "—"}
                                            </td>
                                            <td className="px-4 py-2">
                                                <span
                                                    className="px-2 py-0.5 rounded text-xs font-semibold"
                                                    style={{
                                                        backgroundColor:
                                                            (
                                                                item.status ===
                                                                "in_cutting"
                                                            ) ?
                                                                "#3C86E7"
                                                            :   "#FD9334",
                                                        color: "#fff",
                                                    }}
                                                >
                                                    {(
                                                        item.status ===
                                                        "in_cutting"
                                                    ) ?
                                                        "In Cutting"
                                                    :   "On Warehouse"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                {item.total_pcs}
                                            </td>
                                            <td className="px-4 py-2">
                                                {item.total_weight}
                                            </td>
                                            <td className="px-4 py-2">
                                                {item.selected_weight_ton}
                                            </td>
                                            <td className="px-4 py-2">
                                                {item.calculated_meters}
                                            </td>
                                            <td className="px-4 py-2">
                                                {item.pipe_length_mm}
                                            </td>
                                            <td className="px-4 py-2">
                                                {item.end_date}
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
