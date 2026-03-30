import type { ColumnDef } from "@tanstack/react-table"
import type { Order } from "../-types"
import { OrderActions } from "./use-order-cols"

export const getOrderCols = (): ColumnDef<Order>[] => {
    return [
        {
            accessorKey: "id",
            header: "Order #",
            cell: ({ row: { original } }) => (
                <span className="text-sm font-medium">#{original.id}</span>
            ),
        },
        {
            accessorKey: "client",
            header: "Client",
            cell: ({ row: { original } }) => (
                <span className="text-sm">{original.client}</span>
            ),
        },
        {
            accessorKey: "payment_type",
            header: "Payment Type",
            cell: ({ row: { original } }) => (
                <span className="text-sm">{original.payment_type}</span>
            ),
        },
        {
            accessorKey: "currency",
            header: "Currency",
            cell: ({ row: { original } }) => (
                <span className="text-sm">{original.currency}</span>
            ),
        },
        {
            accessorKey: "client_currency",
            header: "Client Rate",
            cell: ({ row: { original } }) => (
                <span className="text-sm">
                    {original.client_currency != null ?
                        original.client_currency
                    :   "—"}
                </span>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row: { original } }) => <OrderActions order={original} />,
        },
    ]
}
