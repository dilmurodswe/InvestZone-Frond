import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import i18n from "@/lib/i18n/request"
import { formatNumber } from "@/lib/utils/format-number"
import type { ColumnDef } from "@tanstack/react-table"
import { CheckIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useOrderStore } from "../-hooks/use-order-store"
import type { Order, OrderStatus } from "../-types"
import OrderStatusBadge from "./order-status-badge"
import { ORDER_STATUS_CONFIG } from "./status-config"
import { OrderActions } from "./use-order-cols"

const money = (val: string | number | null | undefined) =>
    formatNumber(val, { decimalScale: 2, isShowZero: true })

const num = (val: string | number | null | undefined) => Number(val ?? 0) || 0

/** Money columns line up on the right and share one numeric type face. */
const numericMeta = {
    thClassName: "text-right",
    tdClassName: "text-right tabular-nums whitespace-nowrap",
}

export const getOrderCols = (): ColumnDef<Order>[] => {
    function StatusCell({ order }: { order: Order }) {
        const { t } = useTranslation()
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
                                style={{ color: cfg.color }}
                                className="flex items-center gap-2 min-w-[240px] px-3 py-2 text-left text-xs font-semibold leading-snug whitespace-normal hover:bg-muted"
                            >
                                {t(cfg.labelKey)}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    function ClickableCell({
        order,
        children,
    }: {
        order: Order
        children: React.ReactNode
    }) {
        const { setOrder } = useOrderStore()
        const detailModal = useModal("order-detail")

        return (
            <span
                className="cursor-pointer"
                onClick={() => {
                    setOrder(order)
                    detailModal.openModal()
                }}
            >
                {children}
            </span>
        )
    }

    return [
        {
            accessorKey: "number",
            header: i18n.t("table.docNumber"),
            cell: ({ row: { original } }) => (
                <ClickableCell order={original}>
                    <span className="text-sm font-medium">
                        {original.number}
                    </span>
                </ClickableCell>
            ),
        },
        {
            accessorKey: "doc_date",
            header: i18n.t("table.date"),
            cell: ({ row: { original } }) => (
                <ClickableCell order={original}>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {/* The form no longer asks for a date — the day the
                            order was created stands in for it. */}
                        {(original.doc_date ?? original.created_at)?.slice(
                            0,
                            10,
                        ) || "—"}
                    </span>
                </ClickableCell>
            ),
        },
        {
            accessorKey: "client",
            header: i18n.t("table.client"),
            cell: ({ row: { original } }) => (
                <ClickableCell order={original}>
                    <span className="text-sm">
                        {original.client?.full_name ?? "—"}
                    </span>
                </ClickableCell>
            ),
        },
        {
            accessorKey: "status",
            header: i18n.t("table.status"),
            cell: ({ row: { original } }) => <StatusCell order={original} />,
        },
        {
            accessorKey: "total_with_vat",
            header: i18n.t("table.sum"),
            meta: numericMeta,
            cell: ({ row: { original } }) => (
                <ClickableCell order={original}>
                    <span className="text-sm font-medium whitespace-nowrap">
                        {money(original.total_with_vat)}{" "}
                        {original.currency?.currency}
                    </span>
                </ClickableCell>
            ),
        },
        {
            accessorKey: "shipped_sum",
            header: i18n.t("table.shippedAmount"),
            meta: numericMeta,
            cell: ({ row: { original } }) => (
                <ClickableCell order={original}>
                    <span className="text-sm whitespace-nowrap">
                        {money(original.shipped_sum)}
                    </span>
                </ClickableCell>
            ),
        },
        {
            accessorKey: "reserved_sum",
            header: i18n.t("table.reserved"),
            meta: numericMeta,
            cell: ({ row: { original } }) => {
                const reserved = num(original.reserved_sum)
                return (
                    <ClickableCell order={original}>
                        <span
                            className={`text-sm whitespace-nowrap ${reserved > 0 ? "" : "text-muted-foreground"}`}
                            title={i18n.t("common.reserveHint")}
                        >
                            {money(original.reserved_sum)}
                        </span>
                    </ClickableCell>
                )
            },
        },
        {
            // «Остаток» — what is still to be shipped on this order.
            id: "remaining",
            header: i18n.t("table.remaining"),
            meta: numericMeta,
            cell: ({ row: { original } }) => {
                const remaining = Math.max(
                    0,
                    num(original.total_with_vat) - num(original.shipped_sum),
                )
                return (
                    <ClickableCell order={original}>
                        <span
                            className={`text-sm whitespace-nowrap ${remaining > 0 ? "" : "text-muted-foreground"}`}
                        >
                            {money(remaining)}
                        </span>
                    </ClickableCell>
                )
            },
        },
        {
            accessorKey: "weight_sum",
            header: i18n.t("table.shipmentWeight"),
            meta: numericMeta,
            cell: ({ row: { original } }) => (
                <ClickableCell order={original}>
                    <span className="text-sm whitespace-nowrap">
                        {formatNumber(original.weight_sum, {
                            decimalScale: 3,
                            isShowZero: true,
                        })}
                    </span>
                </ClickableCell>
            ),
        },
        {
            accessorKey: "warehouse",
            header: i18n.t("table.warehouse"),
            cell: ({ row: { original } }) => (
                <ClickableCell order={original}>
                    <span className="text-sm">
                        {original.warehouse?.name ?? "—"}
                    </span>
                </ClickableCell>
            ),
        },
        {
            accessorKey: "delivery_planned_date",
            header: i18n.t("table.plannedShipmentDate"),
            cell: ({ row: { original } }) => (
                <ClickableCell order={original}>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {original.delivery_planned_date ?? "—"}
                    </span>
                </ClickableCell>
            ),
        },
        {
            accessorKey: "payment_type",
            header: i18n.t("table.paymentType"),
            cell: ({ row: { original } }) => (
                <ClickableCell order={original}>
                    <span className="text-sm">
                        {original.payment_type ?? "—"}
                    </span>
                </ClickableCell>
            ),
        },
        {
            accessorKey: "contract_number",
            header: i18n.t("table.contractNumber"),
            cell: ({ row: { original } }) => (
                <ClickableCell order={original}>
                    <span className="text-sm whitespace-nowrap">
                        {original.contract_number || "—"}
                    </span>
                </ClickableCell>
            ),
        },
        {
            accessorKey: "owner",
            header: i18n.t("table.owner"),
            cell: ({ row: { original } }) => (
                <ClickableCell order={original}>
                    <span className="text-sm whitespace-nowrap">
                        {original.owner ?
                            [
                                original.owner.first_name,
                                original.owner.last_name,
                            ]
                                .filter(Boolean)
                                .join(" ")
                        :   "—"}
                    </span>
                </ClickableCell>
            ),
        },
        {
            accessorKey: "applicable",
            header: i18n.t("table.posted"),
            meta: { thClassName: "text-center", tdClassName: "text-center" },
            cell: ({ row: { original } }) => (
                <ClickableCell order={original}>
                    {original.applicable ?
                        <CheckIcon className="mx-auto h-4 w-4 text-emerald-600" />
                    :   <span className="text-sm text-muted-foreground">—</span>
                    }
                </ClickableCell>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row: { original } }) => <OrderActions order={original} />,
        },
    ]
}
