import type { ColumnDef } from "@tanstack/react-table"
import type { ReadyProduct } from "../-types"

const fmt = (val: number | null | undefined) =>
    val != null ? val.toLocaleString() : "—"

const fmtStr = (val: string | null | undefined) => (val?.trim() ? val : "—")

export const getReadyProductCols = (): ColumnDef<ReadyProduct>[] => [
    {
        accessorKey: "product.name",
        header: "Product",
        cell: ({ row: { original } }) => (
            <div className="flex flex-col">
                <span className="text-sm font-medium">
                    {fmtStr(original.product.name)}
                </span>
                <span className="text-xs text-muted-foreground">
                    {fmtStr(original.product.articul)}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "product.code",
        header: "Code",
        cell: ({ row: { original } }) => (
            <span className="text-sm">{fmt(original.product.code)}</span>
        ),
    },
    {
        accessorKey: "product.price",
        header: "Price",
        cell: ({ row: { original } }) => (
            <span className="text-sm">
                {original.product.price != null ?
                    `$${original.product.price.toLocaleString()}`
                :   "—"}
            </span>
        ),
    },
    {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row: { original } }) => (
            <span className="text-sm">{fmt(original.stock)}</span>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row: { original } }) => (
            <span className="text-sm capitalize">
                {original.status.replace(/_/g, " ")}
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
