import { RollingLabelPrinter } from "@/components/receipt/RollingLabelPrinter"
import type { RollingLabelData } from "@/components/receipt/types"
import { BASE_URL } from "@/lib/constants/base-url"
import { COOKIES } from "@/lib/constants/cookies"
import Cookies from "js-cookie"
import { Printer } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import type { RollingPlan } from "../-types"

export function RollingPlanPrintButton({
    rollingPlan,
}: {
    rollingPlan: RollingPlan
}) {
    const [labelData, setLabelData] = useState<RollingLabelData | null>(null)
    const [loading, setLoading] = useState(false)

    // Only show print button if plan has production (is_plan_fact = true)
    const hasFact = (rollingPlan as RollingPlan & { is_plan_fact?: boolean })
        .is_plan_fact

    if (!hasFact) {
        return null
    }

    const handlePrint = async () => {
        setLoading(true)
        try {
            const token = Cookies.get(COOKIES.ACCESS_TOKEN)
            const response = await fetch(
                `${BASE_URL}rolling-plans/${rollingPlan.id}/print-label/`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )

            if (response.ok) {
                const data = await response.json()
                setLabelData(data)
            } else {
                const error = await response.json()
                toast.error(error.error || "Label ma'lumotlari yuklanmadi")
            }
        } catch (error) {
            console.error("Print error:", error)
            toast.error("Xatolik yuz berdi")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={handlePrint}
                disabled={loading}
                className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Печать этикетки"
            >
                <Printer className="w-4 h-4" />
                {loading ? "..." : "Печать"}
            </button>
            {labelData && (
                <RollingLabelPrinter
                    data={labelData}
                    onFinish={() => setLabelData(null)}
                />
            )}
        </>
    )
}
