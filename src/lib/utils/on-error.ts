import { toast } from "sonner"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function onError(err: any) {
    const errorData = err?.response?.data

    if (errorData && Object.keys(errorData).length > 0) {
        const formattedMessage = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${value}`)
            .join("; ")

        toast.error(formattedMessage, { duration: 5000 })
    } else {
        toast.error(err?.message || "An unexpected error occurred", {
            duration: 5000,
        })
    }
}
