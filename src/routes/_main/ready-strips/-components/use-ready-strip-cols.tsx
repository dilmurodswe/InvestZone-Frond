import { formatDecimal } from "@/lib/utils/format-number"
import type { ColumnDef } from "@tanstack/react-table"
import type { ReadyStrip } from "../-types"

export const getReadyStripCols = (): ColumnDef<ReadyStrip>[] => [
    {
        accessorKey: "product_name",
        header: "Product name",
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
        accessorKey: "strip_cut_width_mm",
        header: "Strip cut width (mm)",
        cell: ({ row: { original } }) => (
            <span className="text-sm">{original.strip_cut_width_mm} mm</span>
        ),
    },
    {
        accessorKey: "total_wes",
        header: "Total Wes",
        cell: ({ row: { original } }) => (
            <span className="text-sm font-medium">
                {formatDecimal(original.total_wes)}
            </span>
        ),
    },
    {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row: { original } }) => (
            <span className="text-sm font-medium">
                {formatDecimal(original.quantity)}
            </span>
        ),
    },
    {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ row: { original } }) => (
            <span className="text-sm text-muted-foreground">
                {new Date(original.created_at).toLocaleDateString()}
            </span>
        ),
    },
]
