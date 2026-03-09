import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_main/extra/")({
    component: () => <div>Ready Products</div>,
})