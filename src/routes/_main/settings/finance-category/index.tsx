import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import { createFileRoute } from "@tanstack/react-router"
import Index from "./-components"

export const Route = createFileRoute("/_main/settings/finance-category/")({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <>
            <Navbar links={[{ label: "Settings" }]} />
            <Layout>
                <Index />
            </Layout>
        </>
    )
}
