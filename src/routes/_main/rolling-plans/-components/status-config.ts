import type { RollingPlanStatus } from "../-types"

export const ROLLING_PLAN_STATUS_CONFIG: Record<
    RollingPlanStatus,
    { label: string; bg: string; color: string }
> = {
    on_warehouse: { label: "On Warehouse", bg: "#FD9334", color: "#fff" },
    in_cutting: { label: "In Cutting", bg: "#3C86E7", color: "#fff" },
}

export const ALL_ROLLING_PLAN_STATUSES = Object.keys(
    ROLLING_PLAN_STATUS_CONFIG,
) as RollingPlanStatus[]
