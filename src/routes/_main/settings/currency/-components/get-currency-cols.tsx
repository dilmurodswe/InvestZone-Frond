import type { ColumnDef } from "@tanstack/react-table"
import type { Currency } from "../-types"
import { ActiveToggle, CurrencyActions } from "./use-currency-cols"

export const getCurrencyCols = (): ColumnDef<Currency>[] => {
    return [
        {
            accessorKey: "currency",
            header: "Currency",
            cell: ({ row: { original } }) => (
                <span className="text-sm font-medium">{original.currency}</span>
            ),
        },
        {
            accessorKey: "current_rate",
            header: "Current Rate",
            cell: ({ row: { original } }) => (
                <span className="text-sm">{original.current_rate}</span>
            ),
        },
        {
            accessorKey: "is_active",
            header: "Active",
            cell: ({ row: { original } }) => (
                <ActiveToggle currency={original} />
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row: { original } }) => (
                <CurrencyActions currency={original} />
            ),
        },
    ]
}
