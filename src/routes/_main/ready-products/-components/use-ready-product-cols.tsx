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
        accessorKey: "raw_item_detail.weight",
        header: "Weight",
        cell: ({ row: { original } }) => (
            <span className="text-sm">
                {fmt(original.raw_item_detail.weight)}
            </span>
        ),
    },
    {
        accessorKey: "raw_item_detail.ton",
        header: "Ton",
        cell: ({ row: { original } }) => (
            <span className="text-sm">{fmt(original.raw_item_detail.ton)}</span>
        ),
    },
    {
        accessorKey: "raw_item_detail.wagon",
        header: "Wagon",
        cell: ({ row: { original } }) => (
            <span className="text-sm">
                {fmt(original.raw_item_detail.wagon)}
            </span>
        ),
    },
    {
        accessorKey: "raw_item_detail.reference_number",
        header: "Reference",
        cell: ({ row: { original } }) => (
            <span className="text-sm">
                {fmtStr(original.raw_item_detail.reference_number)}
            </span>
        ),
    },
    {
        accessorKey: "raw_item_detail.price",
        header: "Raw price",
        cell: ({ row: { original } }) => (
            <span className="text-sm">
                {original.raw_item_detail.price != null ?
                    `$${original.raw_item_detail.price.toLocaleString()}`
                :   "—"}
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
