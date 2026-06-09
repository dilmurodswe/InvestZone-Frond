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
                className="inline-flex items-center justify-center gap-1 h-7 px-2.5 rounded-md bg-primary hover:bg-primary/90 text-white text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                title="Печать этикетки"
            >
                <Printer className="w-3.5 h-3.5" />
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
