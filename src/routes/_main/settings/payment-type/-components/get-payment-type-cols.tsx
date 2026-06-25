import i18n from "@/lib/i18n/request"
import type { ColumnDef } from "@tanstack/react-table"
import type { PaymentType } from "../-types"
import { ActiveToggle, PaymentTypeActions } from "./use-payment-type-cols"

export const getPaymentTypeCols = (): ColumnDef<PaymentType>[] => {
    return [
        {
            accessorKey: "name",
            header: i18n.t("table.paymentType"),
            cell: ({ row: { original } }) => (
                <span className="text-sm font-medium">{original.name}</span>
            ),
        },
        {
            accessorKey: "is_active",
            header: i18n.t("table.active"),
            cell: ({ row: { original } }) => (
                <ActiveToggle paymentType={original} />
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row: { original } }) => (
                <PaymentTypeActions paymentType={original} />
            ),
        },
    ]
}
