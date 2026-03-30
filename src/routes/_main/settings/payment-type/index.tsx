import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_main/settings/payment-type/")({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/_main/settings/payment-type/"!</div>
}
