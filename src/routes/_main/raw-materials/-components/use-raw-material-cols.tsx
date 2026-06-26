import i18n from "@/lib/i18n/request"
import { formatDecimal } from "@/lib/utils/format-number"
import type { ColumnDef } from "@tanstack/react-table"
import type { RawMaterial } from "../-types"
import { StatusBadge } from "./status-badge"

const fmt = (val: number | null | undefined) => formatDecimal(val)

const fmtStr = (val: string | null | undefined) => (val?.trim() ? val : "—")

export const getRawMaterialCols = (): ColumnDef<RawMaterial>[] => [
    {
        accessorKey: "contract_number",
        header: i18n.t("table.contractNumber"),
        cell: ({ row: { original } }) => (
            <span className="text-sm font-medium">
                {fmtStr(original.contract_number)}
            </span>
        ),
    },
    {
        accessorKey: "supplier",
        header: i18n.t("table.supplier"),
        cell: ({ row: { original } }) => (
            <span className="text-sm">{fmtStr(original.supplier)}</span>
        ),
    },
    {
        accessorKey: "raw_material",
        header: i18n.t("table.rawMaterial"),
        cell: ({ row: { original } }) => (
            <span className="text-sm">
                {fmtStr(original.raw_material?.name)}
            </span>
        ),
    },
    {
        accessorKey: "status",
        header: i18n.t("table.status"),
        cell: ({ row: { original } }) => (
            <StatusBadge status={original.status} />
        ),
    },
    {
        accessorKey: "netto",
        header: i18n.t("table.netto"),
        cell: ({ row: { original } }) => (
            <span className="text-sm">{fmt(original.netto)}</span>
        ),
    },
    {
        accessorKey: "inner_size",
        header: i18n.t("table.innerSize"),
        cell: ({ row: { original } }) => (
            <span className="text-sm">{fmt(original.inner_size)}</span>
        ),
    },
    {
        accessorKey: "outer_size",
        header: i18n.t("table.outerSize"),
        cell: ({ row: { original } }) => (
            <span className="text-sm">{fmt(original.outer_size)}</span>
        ),
    },
    {
        accessorKey: "plank",
        header: i18n.t("table.plank"),
        cell: ({ row: { original } }) => (
            <span className="text-sm">{fmtStr(original.plank)}</span>
        ),
    },
    {
        accessorKey: "reference_number",
        header: i18n.t("table.referenceNumber"),
        cell: ({ row: { original } }) => (
            <span className="text-sm">{fmtStr(original.reference_number)}</span>
        ),
    },
    {
        accessorKey: "price",
        header: i18n.t("table.price"),
        cell: ({ row: { original } }) => (
            <span className="text-sm">
                {original.price != null ?
                    `$${formatDecimal(original.price)}`
                :   "—"}
            </span>
        ),
    },
    {
        accessorKey: "wagon",
        header: i18n.t("table.wagon"),
        cell: ({ row: { original } }) => (
            <span className="text-sm">{fmtStr(original.wagon)}</span>
        ),
    },
    {
        accessorKey: "created_at",
        header: i18n.t("table.date"),
        cell: ({ row: { original } }) => (
            <span className="text-sm text-muted-foreground">
                {original.created_at ?
                    new Date(original.created_at).toLocaleDateString()
                :   "—"}
            </span>
        ),
    },
]
