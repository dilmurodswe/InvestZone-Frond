import i18n from "@/lib/i18n/request"
import { formatNumber } from "@/lib/utils/format-number"
import type { ColumnDef } from "@tanstack/react-table"
import type { Income } from "../-types"
import OriginBadge from "../../-components/origin-badge"
import { IncomeActions } from "./income-actions"

export const getIncomeCols = (
    onEdit: (income: Income) => void,
    onDelete: (income: Income) => void,
): ColumnDef<Income>[] => [
    {
        accessorKey: "amount",
        header: i18n.t("table.amount"),
        cell: ({ row: { original } }) => (
            <span className="text-sm font-semibold tabular-nums text-green-600 dark:text-green-500">
                {formatNumber(original.amount, {
                    decimalScale: 2,
                    isShowZero: true,
                })}
            </span>
        ),
    },
    {
        id: "origin",
        header: i18n.t("salary.source"),
        cell: ({ row: { original } }) => (
            <OriginBadge origin={original.origin} />
        ),
    },
    {
        accessorKey: "payment_type",
        header: i18n.t("finCat.kassa"),
        cell: ({ row: { original } }) => (
            <span className="text-sm">{original.payment_type ?? "—"}</span>
        ),
    },
    {
        accessorKey: "order_number",
        header: i18n.t("entity.order"),
        cell: ({ row: { original } }) => (
            <span className="text-sm">
                {original.order_number ? `№${original.order_number}` : "—"}
            </span>
        ),
    },
    {
        accessorKey: "client_name",
        header: i18n.t("table.client"),
        cell: ({ row: { original } }) => (
            <span className="text-sm">{original.client_name ?? "—"}</span>
        ),
    },
    {
        accessorKey: "currency",
        header: i18n.t("table.currency"),
        cell: ({ row: { original } }) => (
            <span className="text-sm">
                {original.currency?.currency} ({original.currency?.current_rate}
                )
            </span>
        ),
    },
    {
        accessorKey: "current_rate",
        header: i18n.t("table.currentRate"),
        cell: ({ row: { original } }) => (
            <span className="text-sm">
                {original.current_rate ?
                    formatNumber(original.current_rate)
                :   "—"}
            </span>
        ),
    },
    {
        accessorKey: "custom_rate",
        header: i18n.t("table.customRate"),
        cell: ({ row: { original } }) => (
            <span className="text-sm">
                {original.custom_rate ?
                    formatNumber(original.custom_rate)
                :   "—"}
            </span>
        ),
    },
    {
        accessorKey: "date",
        header: i18n.t("table.date"),
        cell: ({ row: { original } }) => (
            <span className="text-sm text-muted-foreground">
                {original.date}
            </span>
        ),
    },
    {
        id: "actions",
        header: "",
        cell: ({ row: { original } }) => (
            <IncomeActions
                income={original}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        ),
    },
]
