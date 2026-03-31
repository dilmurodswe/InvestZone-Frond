import { createFileRoute } from "@tanstack/react-router"
import ExpensePage from "./-components"

export const Route = createFileRoute("/_main/finance/expence/")({
    component: ExpensePage,
})
