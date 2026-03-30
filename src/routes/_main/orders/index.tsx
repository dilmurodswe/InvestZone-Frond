import { createFileRoute } from "@tanstack/react-router"
import OrdersPage from "./-components"

export const Route = createFileRoute("/_main/orders/")({
    component: OrdersPage,
})
