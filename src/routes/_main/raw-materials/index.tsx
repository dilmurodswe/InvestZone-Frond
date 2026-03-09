import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_main/raw-materials/")({
  component: () => <div>Raw Materials</div>,
})