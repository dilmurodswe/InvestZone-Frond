import Modal from "@/components/custom/modal"
import { CardTitle } from "@/components/ui/card"
import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { useRollingPlanStore } from "../-hooks/use-rolling-plan-store"
import type { RollingPlanDetail, RollingPlanItem } from "../-types"
import RollingPlanStatusBadge from "./status-badge"
import { ROLLING_PLAN_STATUS_CONFIG } from "./status-config"

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
        {
            deps: [rollingPlan?.id], // ID o'zgarganda qayta fetch
            options: {
                enabled: !!rollingPlan?.id,
                staleTime: 0,
            },
        },
    )

    if (!rollingPlan) return null
    if (isLoading)
        return (
            <div className="py-8 text-center text-sm text-muted-foreground">
                Loading...
            </div>
        )
    if (!data) return null

    const totalSelectedWeight = data.items?.reduce(
        (s, i) => s + (i.selected_weight_ton ?? 0),
        0,
    )
    const latestEndDate = (
        data.items?.map((i) => i.end_date).filter(Boolean) as string[]
    )
        ?.sort()
        .at(-1)
    const latestPlanDate = (
        data.items?.map((i) => i.plan_date).filter(Boolean) as string[]
    )
        ?.sort()
        .at(-1)

    const planStatus = data.status ?? data.items?.[0]?.status

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <CardTitle>Rolling Plan #{data.plan_number}</CardTitle>
                {planStatus && <RollingPlanStatusBadge status={planStatus} />}
            </div>

            <Section title="General">
                <div className="flex flex-col divide-y">
                    <div className="grid grid-cols-3 divide-x">
                        <Cell label="Plan Number" value={data.plan_number} />
                        <Cell label="Machine" value={data.machine?.name} />
                        <Cell
                            label="Date"
                            value={
                                data.date ?
                                    new Date(data.date).toLocaleString()
                                :   undefined
                            }
                        />
                    </div>
                    <div className="grid grid-cols-4 divide-x">
                        <Cell
                            label="Items Count"
                            value={data.items?.length ?? 0}
                        />
                        <Cell
                            label="Total Selected Weight (t)"
                            value={totalSelectedWeight}
                        />
                        <Cell
                            label="Plan Date"
                            value={
                                latestPlanDate ?
                                    new Date(
                                        latestPlanDate,
                                    ).toLocaleDateString()
                                :   undefined
                            }
                        />
                        <Cell
                            label="End Date"
                            value={
                                latestEndDate ?
                                    new Date(latestEndDate).toLocaleDateString()
                                :   undefined
                            }
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
                                        "Thickness",
                                        "Strip Cut Width",
                                        "Status",
                                        "Total Pcs",
                                        "Total Weight",
                                        "Sel. Weight (t)",
                                        "Calc. Meters",
                                        "Pipe Length (mm)",
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
                                    (item: RollingPlanItem, idx: number) => {
                                        const statusConfig =
                                            item.status ?
                                                ROLLING_PLAN_STATUS_CONFIG[
                                                    item.status
                                                ]
                                            :   null
                                        return (
                                            <tr
                                                key={item.id}
                                                className="border-b last:border-0 hover:bg-muted/30"
                                            >
                                                <td className="px-4 py-2 text-muted-foreground">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-4 py-2 max-w-[200px]">
                                                    <span
                                                        className="block truncate"
                                                        title={
                                                            item.product
                                                                ?.name ??
                                                            item.product_name
                                                        }
                                                    >
                                                        {item.product?.name ??
                                                            item.product_name ??
                                                            "—"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2">
                                                    {item.product?.thickness ??
                                                        "—"}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {item.strip_cut_width_mm ??
                                                        "—"}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {statusConfig ?
                                                        <span
                                                            className="px-2 py-0.5 rounded text-xs font-semibold"
                                                            style={{
                                                                backgroundColor:
                                                                    statusConfig.bg,
                                                                color: statusConfig.color,
                                                            }}
                                                        >
                                                            {statusConfig.label}
                                                        </span>
                                                    :   <span className="text-muted-foreground">
                                                            —
                                                        </span>
                                                    }
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
                                            </tr>
                                        )
                                    },
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
