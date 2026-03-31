import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_main/finance/")({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/_main/finance/"!</div>
}
