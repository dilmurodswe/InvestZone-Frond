import { createFileRoute } from "@tanstack/react-router"
import Index from "./-components"

export const Route = createFileRoute("/_main/ready-strips/$manufactureId/")({
    component: Index,
})
