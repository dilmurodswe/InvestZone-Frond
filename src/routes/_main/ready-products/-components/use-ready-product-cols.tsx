import i18n from "@/lib/i18n/request"
import { formatDecimal } from "@/lib/utils/format-number"
import type { ColumnDef } from "@tanstack/react-table"
import type { ReadyProduct } from "../-types"

const fmt = (val: number | null | undefined) => formatDecimal(val)

export const getReadyProductCols = (
    onRowClick: (row: ReadyProduct) => void,
): ColumnDef<ReadyProduct>[] => [
    {
        accessorKey: "thickness",
        header: i18n.t("table.thickness"),
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
        header: i18n.t("table.width"),
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
        header: i18n.t("table.status"),
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
        header: i18n.t("table.date"),
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
