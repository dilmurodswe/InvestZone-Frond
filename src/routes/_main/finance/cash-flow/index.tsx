import { createFileRoute } from "@tanstack/react-router"
import CashFlowPage from "./-components"

export const Route = createFileRoute("/_main/finance/cash-flow/")({
    component: CashFlowPage,
})
