import i18n from "@/lib/i18n/request"
import { formatNumber } from "@/lib/utils/format-number"
import type { ColumnDef } from "@tanstack/react-table"
import type { Expense } from "../-types"

import { ExpenseActions } from "./expense-actions"

export const getExpenseCols = (
    onEdit: (expense: Expense) => void,
    onDelete: (expense: Expense) => void,
): ColumnDef<Expense>[] => [
    {
        accessorKey: "amount",
        header: i18n.t("table.amount"),
        cell: ({ row: { original } }) => (
            <span className="text-sm font-semibold tabular-nums text-red-600 dark:text-red-500">
                {formatNumber(original.amount, {
                    decimalScale: 2,
                    isShowZero: true,
                })}
            </span>
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
        accessorKey: "category",
        header: i18n.t("entity.category"),
        cell: ({ row: { original } }) => (
            <span className="text-sm">{original.category?.name ?? "—"}</span>
        ),
    },
    {
        accessorKey: "subcategory",
        header: i18n.t("entity.subcategory"),
        cell: ({ row: { original } }) => (
            <span className="text-sm">{original.subcategory?.name ?? "—"}</span>
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
            <ExpenseActions
                expense={original}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        ),
    },
]
