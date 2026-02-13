import { ConfirmContext } from "@/providers/confirm-provider"
import { use } from "react"

export function useConfirm() {
    const context = use(ConfirmContext)
    if (!context) {
        throw new Error("useConfirm must be used within a ConfirmProvider")
    }
    return context
}
