import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_main/ready-products/")({
    component: () => <div>Ready Products</div>,
})