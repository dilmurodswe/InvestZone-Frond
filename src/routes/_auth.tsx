import Img from "@/components/custom/img"
import { Card } from "@/components/ui/card"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth")({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div className="bg-background h-screen flex items-center justify-center">
            <Card className="max-w-md w-full mx-4 shadow-none">
                <Img src="/images/logo.svg" className="self-center h-19" />
                <Outlet />
            </Card>
        </div>
    )
}
