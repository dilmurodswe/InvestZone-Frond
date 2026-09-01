import { createFileRoute } from "@tanstack/react-router"
import SalaryPage from "./-components"

export const Route = createFileRoute("/_main/finance/salary/")({
    component: SalaryPage,
})
