import i18n from "@/lib/i18n/request"
import type { ColumnDef } from "@tanstack/react-table"
import type { Currency } from "../-types"
import { ActiveToggle, CurrencyActions } from "./use-currency-cols"

export const getCurrencyCols = (): ColumnDef<Currency>[] => {
    return [
        {
            accessorKey: "currency",
            header: i18n.t("table.currency"),
            cell: ({ row: { original } }) => (
                <span className="text-sm font-medium">{original.currency}</span>
            ),
        },
        {
            accessorKey: "current_rate",
            header: i18n.t("table.currentRate"),
            cell: ({ row: { original } }) => (
                <span className="text-sm">{original.current_rate}</span>
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
