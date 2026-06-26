import i18n from "@/lib/i18n/request"

// i18n keys per status. On this page "received" is shown as "Active".
const STATUS_LABEL_KEYS: Record<string, string> = {
    shipped: "status.shipped",
    in_uzb: "status.inUzb",
    at_station: "status.atStation",
    customs_cleared: "status.customsCleared",
    received: "table.active",
    active: "table.active",
    used: "status.used",
}

const STATUS_CLASSES: Record<string, string> = {
    used: "bg-amber-100 text-amber-700",
    received: "bg-green-100 text-green-700",
    active: "bg-green-100 text-green-700",
}

export function StatusBadge({ status }: { status: string | null }) {
    if (!status) return <span className="text-sm">—</span>
    const labelKey = STATUS_LABEL_KEYS[status]
    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                STATUS_CLASSES[status] ?? "bg-muted text-muted-foreground"
            }`}
        >
            {labelKey ? i18n.t(labelKey as "table.active") : status}
        </span>
    )
}
