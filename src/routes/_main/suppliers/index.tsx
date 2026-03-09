import { createFileRoute } from "@tanstack/react-router"
import Index from "./-components"

export const Route = createFileRoute("/_main/suppliers/")({
    component: Index,
})
