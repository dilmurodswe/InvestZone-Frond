import type { ManufactureStatus } from "../-types"

export const MANUFACTURE_STATUS_CONFIG: Record<
    ManufactureStatus,
    { label: string; bg: string; color: string }
> = {
    ready: { label: "Ready", bg: "#16C647", color: "#fff" },
    request_sent: { label: "Request sent", bg: "#4B1FCF", color: "#fff" },
    waiting_cert: { label: "Waiting cert", bg: "#FD9334", color: "#fff" },
    in_progress: { label: "In progress", bg: "#3C86E7", color: "#fff" },
    completed: { label: "Completed", bg: "#0FA968", color: "#fff" },
}

export const ALL_MANUFACTURE_STATUSES = Object.keys(
    MANUFACTURE_STATUS_CONFIG,
) as ManufactureStatus[]
