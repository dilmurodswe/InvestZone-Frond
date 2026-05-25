import type { ColumnDef } from "@tanstack/react-table"
import type { ReadyProduct } from "../-types"
import { formatDecimal } from "@/lib/utils/format-number"

const fmt = (val: number | null | undefined) => formatDecimal(val)

export const getReadyProductCols = (
    onRowClick: (row: ReadyProduct) => void,
): ColumnDef<ReadyProduct>[] => [
    {
        accessorKey: "thickness",
        header: "Thickness",
        cell: ({ row: { original } }) => (
            <span
                className="text-sm cursor-pointer"
                onClick={() => onRowClick(original)}
            >
                {fmt(original.thickness)}
            </span>
        ),
    },
    {
        accessorKey: "width",
        header: "Width",
        cell: ({ row: { original } }) => (
            <span
                className="text-sm cursor-pointer"
                onClick={() => onRowClick(original)}
            >
                {fmt(original.width)}
            </span>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row: { original } }) => (
            <span
                className="text-sm capitalize cursor-pointer"
                onClick={() => onRowClick(original)}
            >
                {original.status.replace(/_/g, " ")}
            </span>
        ),
    },
    {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ row: { original } }) => (
            <span
                className="text-sm text-muted-foreground cursor-pointer"
                onClick={() => onRowClick(original)}
            >
                {new Date(original.created_at).toLocaleDateString()}
            </span>
        ),
    },
]
