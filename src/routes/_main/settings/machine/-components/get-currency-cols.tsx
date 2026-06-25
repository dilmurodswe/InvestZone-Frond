import i18n from "@/lib/i18n/request"
import type { ColumnDef } from "@tanstack/react-table"
import type { Currency } from "../-types"
import { ActiveToggle, CurrencyActions } from "./use-currency-cols"

export const getCurrencyCols = (): ColumnDef<Currency>[] => {
    return [
        {
            accessorKey: "currency",
            header: i18n.t("table.machines"),
            cell: ({ row: { original } }) => (
                <span className="text-sm font-medium">{original.name}</span>
            ),
        },
        {
            accessorKey: "is_active",
            header: i18n.t("table.active"),
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
