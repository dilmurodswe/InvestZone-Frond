import type { RollingPlanStatus } from "../-types"

export const ROLLING_PLAN_STATUS_CONFIG: Record<
    RollingPlanStatus,
    { label: string; bg: string; color: string }
> = {
    plan: { label: "Plan", bg: "#94A3B8", color: "#fff" },
    submitted: { label: "Submitted", bg: "#A78BFA", color: "#fff" },
    in_progress: { label: "In Progress", bg: "#3C86E7", color: "#fff" },
    completed: { label: "Completed", bg: "#22C55E", color: "#fff" },
}

export const ALL_ROLLING_PLAN_STATUSES = Object.keys(
    ROLLING_PLAN_STATUS_CONFIG,
) as RollingPlanStatus[]
