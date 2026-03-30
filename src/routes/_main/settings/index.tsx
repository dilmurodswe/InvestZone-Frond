import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router"
import CurrencyPage from "./currency/-components"
import PaymentTypePage from "./payment-type/-components"

type SettingsTab = "currency" | "payment-type"

export const Route = createFileRoute("/_main/settings/")({
    validateSearch: (search: Record<string, unknown>) => ({
        tab: (search.tab as SettingsTab) ?? "currency",
    }),
    component: RouteComponent,
})

function RouteComponent() {
    const navigate = useNavigate()
    const { tab: activeTab } = useSearch({ from: "/_main/settings/" })

    const handleTab = (tab: SettingsTab) => {
        navigate({ to: "/settings", search: { tab } })
    }

    return (
        <>
            <Navbar links={[{ label: "Settings" }]} />
            <Layout>
                <div className="flex gap-2 mb-2">
                    <Button
                        className={
                            activeTab === "currency" ?
                                "bg-[#131314] hover:bg-[#131314]"
                            :   ""
                        }
                        variant={
                            activeTab === "currency" ? "default" : "outline"
                        }
                        onClick={() => handleTab("currency")}
                    >
                        Currency
                    </Button>
                    <Button
                        className={
                            activeTab === "payment-type" ?
                                "bg-[#131314] hover:bg-[#131314]"
                            :   ""
                        }
                        variant={
                            activeTab === "payment-type" ? "default" : "outline"
                        }
                        onClick={() => handleTab("payment-type")}
                    >
                        Payment Types
                    </Button>
                </div>

                {activeTab === "currency" && <CurrencyPage />}
                {activeTab === "payment-type" && <PaymentTypePage />}
            </Layout>
        </>
    )
}
