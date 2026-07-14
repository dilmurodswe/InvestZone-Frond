import i18n from "@/lib/i18n/request"
import { formatDecimal } from "@/lib/utils/format-number"
import type { ColumnDef } from "@tanstack/react-table"
import type { ReadyStrip } from "../-types"
import ManufactureStatusBadge from "../../manufactures/-components/status-badge"
import { StatusBadge } from "../../raw-materials/-components/status-badge"

export const getReadyStripCols = (): ColumnDef<ReadyStrip>[] => [
    {
        accessorKey: "product_name",
        header: i18n.t("table.productName"),
        cell: ({ row: { original } }) => (
            <span
                className="text-sm font-medium max-w-[360px] block truncate"
                title={original.product_name}
            >
                {original.product_name}
            </span>
        ),
    },
    {
        accessorKey: "roll",
        header: `${i18n.t("table.plank")} / ${i18n.t("table.referenceNumber")}`,
        cell: ({ row: { original } }) => {
            const rolls = original.rolls ?? []
            if (!rolls.length) return <span className="text-sm">—</span>
            return (
                <div className="flex flex-col gap-0.5 text-sm">
                    {rolls.map((r) => (
                        <span key={r.id} className="whitespace-nowrap">
                            {r.plank || "—"} / {r.reference_number || "—"}
                        </span>
                    ))}
                </div>
            )
        },
    },
    {
        accessorKey: "strip_cut_width_mm",
        header: i18n.t("table.stripCutWidth"),
        cell: ({ row: { original } }) => (
            <span className="text-sm">{original.strip_cut_width_mm} mm</span>
        ),
    },
    {
        accessorKey: "total_wes",
        header: i18n.t("table.totalWeight"),
        cell: ({ row: { original } }) => (
            <span className="text-sm font-medium">
                {formatDecimal(original.total_wes)}
            </span>
        ),
    },
    {
        accessorKey: "status",
        header: i18n.t("table.usage"),
        cell: ({ row: { original } }) => (
            <StatusBadge status={original.status} />
        ),
    },
    {
        accessorKey: "manufacture_status",
        header: i18n.t("table.manufactureStatus"),
        cell: ({ row: { original } }) =>
            original.manufacture_status ?
                <ManufactureStatusBadge status={original.manufacture_status} />
            :   <span className="text-sm">—</span>,
    },
    {
        accessorKey: "created_at",
        header: i18n.t("table.date"),
        cell: ({ row: { original } }) => (
            <span className="text-sm text-muted-foreground">
                {new Date(original.created_at).toLocaleDateString()}
            </span>
        ),
    },
]
