import type { DATE } from "@/lib/constants/date"
import type { SEARCH_PARAMS } from "@/lib/constants/search-params"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import MainLayout from "./-main"

export const Route = createFileRoute("/_main")({
    component: RouteComponent,
    validateSearch: (params: {
        [DATE.FROM]?: string
        [DATE.TO]?: string
        [DATE.MONTH]?: number
        [DATE.YEAR]?: number
        [SEARCH_PARAMS.SEARCH]?: string
        [SEARCH_PARAMS.PAGE]?: number
        [SEARCH_PARAMS.PAGE_SIZE]?: number
        product?: number
    }) => params,
})

function RouteComponent() {
    return (
        <MainLayout>
            <Outlet />
        </MainLayout>
    )
}
