import { useModal } from "@/hooks/use-modal"
import type { ColumnDef } from "@tanstack/react-table"
import { CheckCircle2, Clock } from "lucide-react"
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
            header: "План №",
            cell: ({ row: { original } }) => (
                <ClickableCell plan={original}>
                    <span className="text-sm font-medium">
                        {fmt(original.plan_number)}
                    </span>
                </ClickableCell>
            ),
        },
        {
            id: "machine",
            header: "Станок",
            cell: ({ row: { original } }) => (
                <ClickableCell plan={original}>
                    <span className="text-sm">
                        {fmt(original.machine?.name)}
                    </span>
                </ClickableCell>
            ),
        },
        {
            id: "outer_dimension",
            header: "Нар. размер",
            cell: ({ row: { original } }) => {
                const dims = [
                    ...new Set(
                        original.items
                            ?.map((i) => i.product?.outer_dimension)
                            .filter(Boolean),
                    ),
                ]
                return (
                    <ClickableCell plan={original}>
                        <span className="text-sm">
                            {dims.length ? dims.join(", ") : "—"}
                        </span>
                    </ClickableCell>
                )
            },
        },
        {
            id: "thickness",
            header: "Толщина",
            cell: ({ row: { original } }) => {
                const thicknesses = [
                    ...new Set(
                        original.items
                            ?.map((i) => i.product?.thickness)
                            .filter(Boolean),
                    ),
                ]
                return (
                    <ClickableCell plan={original}>
                        <span className="text-sm">
                            {thicknesses.length ? thicknesses.join(", ") : "—"}
                        </span>
                    </ClickableCell>
                )
            },
        },
        {
            id: "selected_weight_ton",
            header: "Выбор (т)",
            cell: ({ row: { original } }) => {
                const total = original.items?.reduce(
                    (sum, i) => sum + (i.selected_weight_ton ?? 0),
                    0,
                )
                return (
                    <ClickableCell plan={original}>
                        <span className="text-sm">{fmt(total)}</span>
                    </ClickableCell>
                )
            },
        },
        {
            id: "status",
            header: "Статус",
            cell: ({ row: { original } }) => {
                const status = original.status ?? original.items?.[0]?.status
                if (!status)
                    return (
                        <span className="text-muted-foreground text-sm">—</span>
                    )
                return (
                    <RollingPlanStatusBadge
                        status={status}
                        onClick={(e) =>
                            onStatusClick(original, e.currentTarget)
                        }
                    />
                )
            },
        },
        {
            id: "plan_date",
            header: "Дата плана",
            cell: ({ row: { original } }) => {
                const dates = original.items
                    ?.map((i) => i.plan_date)
                    .filter(Boolean) as string[]
                const latest = dates?.sort().at(-1)
                return (
                    <ClickableCell plan={original}>
                        <span className="text-sm text-muted-foreground">
                            {latest ?
                                new Date(latest).toLocaleDateString()
                            :   "—"}
                        </span>
                    </ClickableCell>
                )
            },
        },
        {
            id: "end_date",
            header: "Дата окончания",
            cell: ({ row: { original } }) => {
                const dates = original.items
                    ?.map((i) => i.end_date)
                    .filter(Boolean) as string[]
                const latest = dates?.sort().at(-1)
                return (
                    <ClickableCell plan={original}>
                        <span className="text-sm text-muted-foreground">
                            {latest ? new Date(latest).toLocaleString() : "—"}
                        </span>
                    </ClickableCell>
                )
            },
        },
        {
            id: "is_plan_fact",
            header: "План-факт",
            cell: ({ row: { original } }) => {
                // is_plan_fact may come as a top-level field from the list API
                const hasFact = (
                    original as RollingPlan & { is_plan_fact?: boolean }
                ).is_plan_fact
                return hasFact ?
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-700 border border-green-500/25 whitespace-nowrap">
                            <CheckCircle2 className="w-3 h-3" />
                            Есть
                        </span>
                    :   <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground whitespace-nowrap">
                            <Clock className="w-3 h-3" />
                            Нет
                        </span>
            },
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
