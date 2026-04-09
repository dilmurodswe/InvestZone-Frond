import type { RequestStatus } from "../-types"

export const STATUS_CONFIG: Record<
    RequestStatus,
    { label: string; bg: string; color: string }
> = {
    1: { label: "New", bg: "#939393", color: "#fff" },
    2: { label: "Responded", bg: "#4B1FCF", color: "#fff" },
    3: { label: "Paid", bg: "#FD9334", color: "#fff" },
    4: { label: "In Production", bg: "#16C647", color: "#fff" },
    5: { label: "Completed", bg: "#E73C50", color: "#fff" },
    6: { label: "Canceled", bg: "#3D3D3D", color: "#fff" },
}
