import { createFileRoute } from "@tanstack/react-router"
import IncomePage from "./-components"

export const Route = createFileRoute("/_main/finance/income/")({
    component: IncomePage,
})
