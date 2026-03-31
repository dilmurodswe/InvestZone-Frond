import type { ColumnDef } from "@tanstack/react-table"
import type { Manufacture } from "../-types"
import { ManufactureActions } from "./manufacture-actions"
import ManufactureStatusBadge from "./status-badge"

const fmtStr = (val: string | null | undefined) => (val?.trim() ? val : "—")

export const getManufactureCols = (
    onStatusClick: (manufacture: Manufacture, el: HTMLElement) => void,
    onRowClick: (manufacture: Manufacture) => void,
): ColumnDef<Manufacture>[] => [
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row: { original } }) => (
            <button
                className="text-sm text-left hover:underline hover:text-primary"
                onClick={() => onRowClick(original)}
            >
                {fmtStr(original.category)}
            </button>
        ),
    },
    {
        accessorKey: "sub_category",
        header: "Sub category",
        cell: ({ row: { original } }) => (
            <span className="text-sm">{fmtStr(original.sub_category)}</span>
        ),
    },
    {
        accessorKey: "product",
        header: "Product",
        cell: ({ row: { original } }) => (
            <span className="text-sm">{fmtStr(original.product)}</span>
        ),
    },
    // {
    //     accessorKey: "raw_item_details",
    //     header: "Raw item details",
    //     cell: ({ row: { original } }) => (
    //         <span className="text-sm">{original.raw_item_details ?? "—"}</span>
    //     ),
    // },
    {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row: { original } }) => (
            <span className="text-sm">{original.stock.toLocaleString()}</span>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row: { original } }) => (
            <ManufactureStatusBadge
                status={original.status}
                onClick={(e) => onStatusClick(original, e.currentTarget)}
            />
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
    {
        id: "actions",
        header: "",
        cell: ({ row: { original } }) => (
            <ManufactureActions manufacture={original} />
        ),
    },
]
