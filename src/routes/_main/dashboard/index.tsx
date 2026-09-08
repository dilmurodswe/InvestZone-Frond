import { createFileRoute, redirect } from "@tanstack/react-router"

// The full dashboard (Продажи / Приход / Расход / Взаиморасчёты / kassa) lives
// at /finance/dashboard — keep a single implementation and send this here.
export const Route = createFileRoute("/_main/dashboard/")({
    beforeLoad: () => {
        throw redirect({ to: "/finance/dashboard" })
    },
})
