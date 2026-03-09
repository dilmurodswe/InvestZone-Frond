import { createFileRoute, useNavigate } from "@tanstack/react-router"
import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { redirect } from "@tanstack/react-router"
export const Route = createFileRoute("/_main/extra/")({
    component: Index,
    beforeLoad: () => {
        throw redirect({ to: "/extra/products" })
    },
})

function Index() {
    const navigate = useNavigate()

    return (
        <>
            <Navbar links={[{ label: "Warehouse" }]} />
            <Layout>
                <div className="flex gap-4">
                    <Button className="bg-[#131314] hover:bg-[#131314]" onClick={() => navigate({ to: "/extra/products" })}>
                        Product List
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate({ to: "/extra/raw-materials" })}
                    >
                        Raw Material List
                    </Button>
                </div>
            </Layout>
        </>
    )
}