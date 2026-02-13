import { createFileRoute } from "@tanstack/react-router"
import Login from "./-components"

export const Route = createFileRoute("/_auth/login/")({
    component: Login,
})
