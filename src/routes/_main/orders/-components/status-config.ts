import { useTranslation } from "react-i18next"
import type { OrderStatus } from "../-types"

/**
 * The sales pipeline, in the order the department works by. Colours follow the
 * 1C status list: neutral for the working stages, green when shipped, red for
 * the two closing states (return / cancelled).
 */
export const ORDER_STATUS_CONFIG = {
    new: { labelKey: "status.new", bg: "#f1f5f9", color: "#475569" },
    contract_drafting: {
        labelKey: "status.contractDrafting",
        bg: "#f0e6dc",
        color: "#7c4a21",
    },
    payment: { labelKey: "status.payment", bg: "#e0f2fe", color: "#0369a1" },
    financier_signature: {
        labelKey: "status.financierSignature",
        bg: "#ffedd5",
        color: "#c2410c",
    },
    shipment_request: {
        labelKey: "status.shipmentRequest",
        bg: "#ede9fe",
        color: "#6d28d9",
    },
    position_change: {
        labelKey: "status.positionChange",
        bg: "#dbeafe",
        color: "#1e3a8a",
    },
    shipping_documents: {
        labelKey: "status.shippingDocuments",
        bg: "#fef9c3",
        color: "#854d0e",
    },
    shipped: { labelKey: "status.shipped", bg: "#dcfce7", color: "#15803d" },
    returned: { labelKey: "status.returned", bg: "#fee2e2", color: "#b91c1c" },
    cancelled: { labelKey: "status.canceled", bg: "#fee2e2", color: "#b91c1c" },
    shipped_check: {
        labelKey: "status.shippedCheck",
        bg: "#e5e7eb",
        color: "#111827",
    },
} as const satisfies Record<
    OrderStatus,
    { labelKey: string; bg: string; color: string }
>

export const ORDER_STATUS_LIST = Object.keys(
    ORDER_STATUS_CONFIG,
) as OrderStatus[]

export type OrderStatusOption = {
    id: OrderStatus
    name: string
    bg: string
    color: string
}

/** Status filter/select options — labels in the active language, with colours. */
export function useOrderStatusOptions(): OrderStatusOption[] {
    const { t } = useTranslation()
    return ORDER_STATUS_LIST.map((id) => ({
        id,
        name: t(ORDER_STATUS_CONFIG[id].labelKey),
        bg: ORDER_STATUS_CONFIG[id].bg,
        color: ORDER_STATUS_CONFIG[id].color,
    }))
}
