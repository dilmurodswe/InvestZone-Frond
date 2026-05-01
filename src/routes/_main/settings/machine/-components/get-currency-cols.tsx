import type { ColumnDef } from "@tanstack/react-table"
import type { Currency } from "../-types"
import { ActiveToggle, CurrencyActions } from "./use-currency-cols"

export const getCurrencyCols = (): ColumnDef<Currency>[] => {
    return [
        {
            accessorKey: "currency",
            header: "Machines",
            cell: ({ row: { original } }) => (
                <span className="text-sm font-medium">{original.name}</span>
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
