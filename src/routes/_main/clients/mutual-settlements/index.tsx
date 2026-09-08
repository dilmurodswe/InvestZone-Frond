import { createFileRoute } from "@tanstack/react-router"
import MutualSettlementsPage from "./-components"

export const Route = createFileRoute("/_main/clients/mutual-settlements/")({
    component: MutualSettlementsPage,
})
