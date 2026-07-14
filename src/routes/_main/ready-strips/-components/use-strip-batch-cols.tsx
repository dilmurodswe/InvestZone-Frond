import i18n from "@/lib/i18n/request"
import { formatDecimal } from "@/lib/utils/format-number"
import type { ColumnDef } from "@tanstack/react-table"
import { ChevronRight } from "lucide-react"
import type { StripBatch } from "../-types"

export const getStripBatchCols = (): ColumnDef<StripBatch>[] => [
    {
        accessorKey: "product_name",
        header: i18n.t("table.productName"),
        cell: ({ row: { original } }) => (
            <div className="group flex items-center gap-1.5">
                <span
                    className="text-sm font-medium max-w-[320px] block truncate"
                    title={original.product_name ?? undefined}
                >
                    {original.product_name ?? "—"}
                </span>
                {original.products_count > 1 && (
                    <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                        +{original.products_count - 1}
                    </span>
                )}
                <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
            </div>
        ),
    },
    {
        accessorKey: "strip_count",
        header: i18n.t("table.stripsCount"),
        cell: ({ row: { original } }) => (
            <span className="text-sm font-medium">{original.strip_count}</span>
        ),
    },
    {
        accessorKey: "total_weight",
        header: i18n.t("table.totalWeight"),
        cell: ({ row: { original } }) => (
            <span className="text-sm font-medium">
                {formatDecimal(original.total_weight)}
            </span>
        ),
    },
    {
        accessorKey: "left_over",
        header: i18n.t("table.otxod"),
        cell: ({ row: { original } }) => (
            <span className="text-sm">
                {original.left_over != null ?
                    formatDecimal(original.left_over)
                :   "—"}
            </span>
        ),
    },
    {
        accessorKey: "thickness",
        header: i18n.t("table.thickness"),
        cell: ({ row: { original } }) => (
            <span className="text-sm">{original.thickness ?? "—"}</span>
        ),
    },
    {
        accessorKey: "width",
        header: i18n.t("table.width"),
        cell: ({ row: { original } }) => (
            <span className="text-sm">{original.width ?? "—"}</span>
        ),
    },
    {
        accessorKey: "count_raw",
        header: i18n.t("table.rollsCount"),
        cell: ({ row: { original } }) => (
            <span className="text-sm">{original.count_raw ?? "—"}</span>
        ),
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
