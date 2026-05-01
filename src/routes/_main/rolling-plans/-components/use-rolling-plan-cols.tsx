import { useModal } from "@/hooks/use-modal"
import type { ColumnDef } from "@tanstack/react-table"
import { useRollingPlanStore } from "../-hooks/use-rolling-plan-store"
import type { RollingPlan } from "../-types"
import { RollingPlanActions } from "./rolling-plan-actions"
import RollingPlanStatusBadge from "./status-badge"

const fmt = (val: string | number | null | undefined) =>
    val != null && val !== "" ? val : "—"

export const getRollingPlanCols = (
    onStatusClick: (plan: RollingPlan, el: HTMLElement) => void,
): ColumnDef<RollingPlan>[] => {
    function ClickableCell({
        plan,
        children,
    }: {
        plan: RollingPlan
        children: React.ReactNode
    }) {
        const { setRollingPlan } = useRollingPlanStore()
        const detailModal = useModal("rolling-plan-detail")

        return (
            <span
                className="cursor-pointer"
                onClick={() => {
                    setRollingPlan(plan)
                    detailModal.openModal()
                }}
            >
                {children}
            </span>
        )
    }

    return [
        {
            accessorKey: "plan_number",
            header: "Plan #",
            cell: ({ row: { original } }) => (
                <ClickableCell plan={original}>
                    <span className="text-sm font-medium">
                        {fmt(original.plan_number)}
                    </span>
                </ClickableCell>
            ),
        },
        {
            accessorKey: "machine_name",
            header: "Machine",
            cell: ({ row: { original } }) => (
                <ClickableCell plan={original}>
                    <span className="text-sm">
                        {fmt(original.machine_name)}
                    </span>
                </ClickableCell>
            ),
        },
        {
            id: "items_count",
            header: "Items",
            cell: ({ row: { original } }) => (
                <ClickableCell plan={original}>
                    <span className="text-sm">
                        {original.items?.length > 0 ?
                            `${original.items.length} item(s)`
                        :   "—"}
                    </span>
                </ClickableCell>
            ),
        },
        {
            id: "total_pcs",
            header: "Total Pcs",
            cell: ({ row: { original } }) => (
                <ClickableCell plan={original}>
                    <span className="text-sm">
                        {fmt(
                            original.items?.reduce(
                                (sum, i) => sum + (i.total_pcs ?? 0),
                                0,
                            ),
                        )}
                    </span>
                </ClickableCell>
            ),
        },
        {
            id: "total_weight",
            header: "Total Weight",
            cell: ({ row: { original } }) => (
                <ClickableCell plan={original}>
                    <span className="text-sm">
                        {fmt(
                            original.items?.reduce(
                                (sum, i) => sum + (i.total_weight ?? 0),
                                0,
                            ),
                        )}
                    </span>
                </ClickableCell>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row: { original } }) => (
                <RollingPlanStatusBadge
                    status={original.status}
                    onClick={(e) => onStatusClick(original, e.currentTarget)}
                />
            ),
        },
        {
            accessorKey: "created_at",
            header: "Date",
            cell: ({ row: { original } }) => (
                <ClickableCell plan={original}>
                    <span className="text-sm text-muted-foreground">
                        {new Date(original.created_at).toLocaleDateString()}
                    </span>
                </ClickableCell>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row: { original } }) => (
                <RollingPlanActions rollingPlan={original} />
            ),
        },
    ]
}
