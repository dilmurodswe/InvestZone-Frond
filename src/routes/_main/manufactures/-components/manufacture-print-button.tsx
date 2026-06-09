import {
    ManufactureLabelPrinter,
    type ManufactureLabelData,
} from "@/components/receipt"
import { BASE_URL } from "@/lib/constants/base-url"
import { COOKIES } from "@/lib/constants/cookies"
import Cookies from "js-cookie"
import { Printer } from "lucide-react"
import { useState } from "react"
import type { Manufacture } from "../-types"

export function ManufacturePrintButton({
    manufacture,
}: {
    manufacture: Manufacture
}) {
    const [labelData, setLabelData] = useState<ManufactureLabelData | null>(
        null,
    )
    const [loading, setLoading] = useState(false)

    const handlePrint = async () => {
        setLoading(true)
        try {
            const token = Cookies.get(COOKIES.ACCESS_TOKEN)
            const response = await fetch(
                `${BASE_URL}manufactures/${manufacture.id}/print-label/`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                },
            )

            if (response.ok) {
                const data = await response.json()
                setLabelData(data)
            } else {
                console.error("Print failed:", response.status)
                alert("Xatolik: Label ma'lumotlari yuklanmadi")
            }
        } catch (error) {
            console.error("Print error:", error)
            alert(
                "Xatolik: " +
                    (error instanceof Error ? error.message : "Noma'lum xato"),
            )
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
                <ManufactureLabelPrinter
                    data={labelData}
                    onFinish={() => setLabelData(null)}
                />
            )}
        </>
    )
}
