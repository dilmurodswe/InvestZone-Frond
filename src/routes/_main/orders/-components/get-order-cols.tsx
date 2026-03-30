import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { API } from "@/lib/constants/api-endpoints"
import type { ColumnDef } from "@tanstack/react-table"
import { useEffect, useRef, useState } from "react"
import type { Order, OrderStatus } from "../-types"
import OrderStatusBadge from "./order-status-badge"
import { ORDER_STATUS_CONFIG } from "./status-config"
import { OrderActions } from "./use-order-cols"

export const getOrderCols = (): ColumnDef<Order>[] => {
    function StatusCell({ order }: { order: Order }) {
        const [open, setOpen] = useState(false)
        const [pos, setPos] = useState({ top: 0, left: 0 })
        const ref = useRef<HTMLDivElement>(null)
        const { patch } = useRequest()
        const { invalidateByExactMatch } = useRevalidate()

        useEffect(() => {
            const handler = (e: MouseEvent) => {
                if (ref.current && !ref.current.contains(e.target as Node))
                    setOpen(false)
            }
            document.addEventListener("mousedown", handler)
            return () => document.removeEventListener("mousedown", handler)
        }, [])

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            const rect = e.currentTarget.getBoundingClientRect()
            setPos({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
            })
            setOpen((v) => !v)
        }

        const handleSelect = (status: OrderStatus) => {
            patch(
                API.ORDERS.ID.INDEX.replace("{id}", String(order.id)),
                { status },
                {
                    onSuccess: () => invalidateByExactMatch([API.ORDERS.INDEX]),
                },
            )
            setOpen(false)
        }

        return (
            <div ref={ref}>
                <OrderStatusBadge status={order.status} onClick={handleClick} />
                {open && (
                    <div
                        style={{
                            position: "fixed",
                            top: pos.top,
                            left: pos.left,
                            zIndex: 9999,
                        }}
                        className="bg-white rounded-xl shadow-lg border flex flex-col overflow-hidden"
                    >
                        {(
                            Object.entries(ORDER_STATUS_CONFIG) as [
                                OrderStatus,
                                (typeof ORDER_STATUS_CONFIG)[OrderStatus],
                            ][]
                        ).map(([key, cfg]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => handleSelect(key)}
                                style={{
                                    width: 160,
                                    height: 36,
                                    padding: "0 12px",
                                    color: cfg.color,
                                }}
                                className="flex items-center gap-2 text-xs font-semibold hover:bg-muted"
                            >
                                {cfg.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        )
    }
    return [
        {
            accessorKey: "client",
            header: "Client",
            cell: ({ row: { original } }) => (
                <span className="text-sm">{original.client}</span>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row: { original } }) => <StatusCell order={original} />,
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
                <span className="text-sm">
                    {original.currency?.currency} (
                    {original.currency?.current_rate})
                </span>
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
            accessorKey: "items",
            header: "Products",
            cell: ({ row: { original } }) => (
                <span className="text-sm">
                    {original.items?.length ?? 0} item
                </span>
            ),
        },
        {
            accessorKey: "created_at",
            header: "Date",
            cell: ({ row: { original } }) => (
                <span className="text-sm text-muted-foreground">
                    {original.created_at}
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
