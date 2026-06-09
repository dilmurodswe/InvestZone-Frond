import {
    ManufactureLabelPrinter,
    type ManufactureLabelData,
} from "@/components/receipt"
import { BASE_URL } from "@/lib/constants/base-url"
import { COOKIES } from "@/lib/constants/cookies"
import Cookies from "js-cookie"
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
                className="inline-flex items-center justify-center h-8 px-3 rounded-md border text-sm hover:bg-muted transition-colors disabled:opacity-50"
            >
                {loading ? "Yuklanmoqda..." : "Печать"}
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
