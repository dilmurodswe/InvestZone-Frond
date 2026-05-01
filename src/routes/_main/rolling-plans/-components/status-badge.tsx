import { ChevronDown } from "lucide-react"
import type { RollingPlanStatus } from "../-types"
import { ROLLING_PLAN_STATUS_CONFIG } from "./status-config"

interface StatusBadgeProps {
    status: RollingPlanStatus
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export default function RollingPlanStatusBadge({
    status,
    onClick,
}: StatusBadgeProps) {
    const config = ROLLING_PLAN_STATUS_CONFIG[status]
    if (!config)
        return (
            <span className="text-xs text-muted-foreground">
                {status ?? "—"}
            </span>
        )
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap"
            style={{ backgroundColor: config.bg, color: config.color }}
        >
            {config.label}
            {onClick && <ChevronDown className="size-4" />}
        </button>
    )
}
