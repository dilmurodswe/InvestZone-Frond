import type { RequestStatus } from "../-types"

export const STATUS_CONFIG: Record<
    RequestStatus,
    { label: string; bg: string; color: string }
> = {
    1: { label: "New request", bg: "#939393", color: "#fff" },
    2: { label: "Factory", bg: "#4B1FCF", color: "#fff" },
    3: { label: "On road", bg: "#FD9334", color: "#fff" },
    4: { label: "Accepted", bg: "#16C647", color: "#fff" },
    5: { label: "Station", bg: "#E73C50", color: "#fff" },
    6: { label: "In UZB", bg: "#3C86E7", color: "#fff" },
}
