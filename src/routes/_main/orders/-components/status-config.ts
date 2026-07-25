import { useTranslation } from "react-i18next"
import type { OrderStatus } from "../-types"

export const ORDER_STATUS_CONFIG = {
    new: { labelKey: "status.new", bg: "#e0f2fe", color: "#0369a1" },
    in_processing: {
        labelKey: "status.inProgress",
        bg: "#fef9c3",
        color: "#854d0e",
    },
    reserved: { labelKey: "status.reserved", bg: "#ede9fe", color: "#6d28d9" },
    shipped: { labelKey: "status.shipped", bg: "#cffafe", color: "#0e7490" },
    completed: { labelKey: "status.completed", bg: "#dcfce7", color: "#15803d" },
    cancelled: { labelKey: "status.canceled", bg: "#fee2e2", color: "#b91c1c" },
} as const satisfies Record<
    OrderStatus,
    { labelKey: string; bg: string; color: string }
>

export const ORDER_STATUS_LIST = Object.keys(
    ORDER_STATUS_CONFIG,
) as OrderStatus[]

/** Status filter/select options with labels in the active language. */
export function useOrderStatusOptions() {
    const { t } = useTranslation()
    return ORDER_STATUS_LIST.map((id) => ({
        id,
        name: t(ORDER_STATUS_CONFIG[id].labelKey),
    }))
}
