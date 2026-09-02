import { useProfileQuery } from "@/hooks/react-query/use-profile-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

export const Route = createFileRoute("/_main/")({
    // loader: () => {
    //     throw redirect({ to: "/dashboard" })
    // },
    component: Index,
})

export default function Index() {
    const { isAdmin, isManager, isAuthenticated, isFetched, isFetching } =
        useProfileQuery()
    const navigate = useNavigate()

    useEffect(() => {
        if (isFetched && !isFetching) {
            if (isAdmin) {
                navigate({ to: "/finance/dashboard", replace: true })
            }
            if (isManager) {
                navigate({ to: "/clients", replace: true })
            }
            if (!isAuthenticated) {
                navigate({ to: "/login", replace: true })
            }
        }
    }, [isAdmin, isAuthenticated, isFetched, isFetching, isManager, navigate])

    return null
}
