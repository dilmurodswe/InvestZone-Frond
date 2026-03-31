import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_main/finance/dashboard/")({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/_main/finance/dashboard/"!</div>
}
