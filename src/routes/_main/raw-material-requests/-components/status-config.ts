import type { ParseKeys } from "i18next"
import type { RequestStatus } from "../-types"

export const STATUS_CONFIG: Record<
    RequestStatus,
    { labelKey: ParseKeys; bg: string; color: string }
> = {
    1: { labelKey: "status.new", bg: "#939393", color: "#fff" },
    2: { labelKey: "status.responded", bg: "#4B1FCF", color: "#fff" },
    3: { labelKey: "status.paid", bg: "#FD9334", color: "#fff" },
    4: { labelKey: "status.inProduction", bg: "#16C647", color: "#fff" },
    5: { labelKey: "status.completed", bg: "#E73C50", color: "#fff" },
    6: { labelKey: "status.canceled", bg: "#3D3D3D", color: "#fff" },
}
