import { createFileRoute } from "@tanstack/react-router"
import DemandsPage from "./-components"

export const Route = createFileRoute("/_main/demands/")({
    component: DemandsPage,
})
