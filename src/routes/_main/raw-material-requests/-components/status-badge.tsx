import { ChevronDown } from "lucide-react"
import type { RequestStatus } from "../-types"
import { STATUS_CONFIG } from "./status-config"

interface StatusBadgeProps {
    status: RequestStatus
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export default function StatusBadge({ status, onClick }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status]
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
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap w-[150px] justify-between"
            style={{ backgroundColor: config.bg, color: config.color }}
        >
            {config.label}
            {onClick && <ChevronDown className="size-4" />}
        </button>
    )
}
