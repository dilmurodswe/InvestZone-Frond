import { createFileRoute } from "@tanstack/react-router"
import Index from "./-components"

export const Route = createFileRoute("/_main/task-manager/")({
    component: Index,
})
