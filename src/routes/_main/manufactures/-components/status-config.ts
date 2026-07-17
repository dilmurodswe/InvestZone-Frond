import type { ManufactureStatus } from "../-types"

export const MANUFACTURE_STATUS_CONFIG: Record<
    ManufactureStatus,
    { labelKey: string; bg: string; color: string }
> = {
    ready: { labelKey: "status.ready", bg: "#16C647", color: "#fff" },
    request_sent: {
        labelKey: "status.requestSent",
        bg: "#4B1FCF",
        color: "#fff",
    },
    waiting_cert: {
        labelKey: "status.waitingCert",
        bg: "#FD9334",
        color: "#fff",
    },
    in_progress: {
        labelKey: "status.inProgress",
        bg: "#3C86E7",
        color: "#fff",
    },
    completed: { labelKey: "status.completed", bg: "#0FA968", color: "#fff" },
}

export const ALL_MANUFACTURE_STATUSES = Object.keys(
    MANUFACTURE_STATUS_CONFIG,
) as ManufactureStatus[]
