import i18n from "@/lib/i18n/request"
import { formatDecimal } from "@/lib/utils/format-number"
import type { ColumnDef } from "@tanstack/react-table"
import type { ReadyStrip } from "../-types"
import { ReadyStripPrintButton } from "./ready-strip-print-button"

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
        header: i18n.t("table.roll"),
        cell: ({ row: { original } }) => {
            const parts = [
                original.roll_plank,
                original.roll_reference_number,
            ].filter(Boolean)
            return (
                <span className="text-sm">
                    {parts.length ?
                        parts.join(" / ")
                    : original.roll_id ?
                        `#${original.roll_id}`
                    :   "—"}
                </span>
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
        accessorKey: "quantity",
        header: i18n.t("table.quantity"),
        cell: ({ row: { original } }) => (
            <span className="text-sm font-medium">
                {formatDecimal(original.quantity)}
            </span>
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
    {
        id: "print_label",
        header: i18n.t("common.print"),
        cell: ({ row: { original } }) => (
            <ReadyStripPrintButton manufactureId={original.manufacture_id} />
        ),
    },
]
