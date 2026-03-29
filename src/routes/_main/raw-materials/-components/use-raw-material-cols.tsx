import type { ColumnDef } from "@tanstack/react-table"
import type { RawMaterial } from "../-types"

const fmt = (val: number | null | undefined) =>
    val != null ? val.toLocaleString() : "—"

const fmtStr = (val: string | null | undefined) => (val?.trim() ? val : "—")

export const getRawMaterialCols = (): ColumnDef<RawMaterial>[] => [
    {
        accessorKey: "contract_number",
        header: "Contract number",
        cell: ({ row: { original } }) => (
            <span className="text-sm font-medium">
                {fmtStr(original.contract_number)}
            </span>
        ),
    },
    {
        accessorKey: "supplier",
        header: "Supplier",
        cell: ({ row: { original } }) => (
            <span className="text-sm">{fmtStr(original.supplier)}</span>
        ),
    },
    {
        accessorKey: "raw_material_name",
        header: "Raw material",
        cell: ({ row: { original } }) => (
            <span className="text-sm">
                {fmtStr(original.raw_material_name)}
            </span>
        ),
    },
    {
        accessorKey: "ton",
        header: "Ton",
        cell: ({ row: { original } }) => (
            <span className="text-sm">{fmt(original.ton)}</span>
        ),
    },
    {
        accessorKey: "weight",
        header: "Weight",
        cell: ({ row: { original } }) => (
            <span className="text-sm">{fmt(original.weight)}</span>
        ),
    },
    {
        accessorKey: "netto",
        header: "Netto",
        cell: ({ row: { original } }) => (
            <span className="text-sm">{fmt(original.netto)}</span>
        ),
    },
    {
        accessorKey: "inner_size",
        header: "Inner size",
        cell: ({ row: { original } }) => (
            <span className="text-sm">{fmt(original.inner_size)}</span>
        ),
    },
    {
        accessorKey: "outer_size",
        header: "Outer size",
        cell: ({ row: { original } }) => (
            <span className="text-sm">{fmt(original.outer_size)}</span>
        ),
    },
    {
        accessorKey: "standard",
        header: "Standard",
        cell: ({ row: { original } }) => (
            <span className="text-sm">{fmtStr(original.standard)}</span>
        ),
    },
    {
        accessorKey: "mark",
        header: "Mark",
        cell: ({ row: { original } }) => (
            <span className="text-sm">{fmtStr(original.mark)}</span>
        ),
    },
    {
        accessorKey: "plank",
        header: "Plank",
        cell: ({ row: { original } }) => (
            <span className="text-sm">{fmtStr(original.plank)}</span>
        ),
    },
    {
        accessorKey: "reference_number",
        header: "Reference number",
        cell: ({ row: { original } }) => (
            <span className="text-sm">{fmtStr(original.reference_number)}</span>
        ),
    },
    {
        accessorKey: "price",
        header: "Price",
        cell: ({ row: { original } }) => (
            <span className="text-sm">
                {original.price != null ?
                    `$${original.price.toLocaleString()}`
                :   "—"}
            </span>
        ),
    },
    {
        accessorKey: "wagon",
        header: "Wagon",
        cell: ({ row: { original } }) => (
            <span className="text-sm">{fmt(original.wagon)}</span>
        ),
    },
    {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ row: { original } }) => (
            <span className="text-sm text-muted-foreground">
                {original.created_at ?
                    new Date(original.created_at).toLocaleDateString()
                :   "—"}
            </span>
        ),
    },
]
