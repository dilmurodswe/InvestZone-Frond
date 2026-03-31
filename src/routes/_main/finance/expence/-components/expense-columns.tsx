import type { ColumnDef } from "@tanstack/react-table"
import type { Expense } from "../-types"

import { ExpenseActions } from "./expense-actions"

export const getExpenseCols = (
    onEdit: (expense: Expense) => void,
    onDelete: (expense: Expense) => void,
): ColumnDef<Expense>[] => [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row: { original } }) => (
            <span className="text-sm font-medium">{original.name}</span>
        ),
    },
    {
        accessorKey: "payment_type",
        header: "Payment Type",
        cell: ({ row: { original } }) => (
            <span className="text-sm">{original.payment_type ?? "—"}</span>
        ),
    },
    {
        accessorKey: "currency",
        header: "Currency",
        cell: ({ row: { original } }) => (
            <span className="text-sm">
                {original.currency?.currency} ({original.currency?.current_rate}
                )
            </span>
        ),
    },
    {
        accessorKey: "current_rate",
        header: "Current Rate",
        cell: ({ row: { original } }) => (
            <span className="text-sm">{original.current_rate ?? "—"}</span>
        ),
    },
    {
        accessorKey: "custom_rate",
        header: "Custom Rate",
        cell: ({ row: { original } }) => (
            <span className="text-sm">{original.custom_rate ?? "—"}</span>
        ),
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row: { original } }) => (
            <span className="text-sm font-semibold">{original.amount}</span>
        ),
    },
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row: { original } }) => (
            <span className="text-sm text-muted-foreground">
                {original.date}
            </span>
        ),
    },
    {
        accessorKey: "comment",
        header: "Comment",
        cell: ({ row: { original } }) => (
            <span className="text-sm text-muted-foreground">
                {original.comment ?? "—"}
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
