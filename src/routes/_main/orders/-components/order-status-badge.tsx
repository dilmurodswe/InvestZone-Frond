import { ChevronDown } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { OrderStatus } from "../-types"
import { ORDER_STATUS_CONFIG } from "./status-config"

interface Props {
    status: OrderStatus
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export default function OrderStatusBadge({ status, onClick }: Props) {
    const { t } = useTranslation()
    const config = ORDER_STATUS_CONFIG[status]
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
            {t(config.labelKey)}
            {onClick && <ChevronDown className="size-4" />}
        </button>
    )
}
