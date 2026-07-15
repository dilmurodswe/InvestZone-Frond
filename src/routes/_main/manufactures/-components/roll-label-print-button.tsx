import { StripLabelPrinter } from "@/components/receipt/StripLabelPrinter"
import type { StripLabelData } from "@/components/receipt/renderStripLabel"
import { Printer } from "lucide-react"
import { useState } from "react"

/**
 * Per-roll "Печать" button for the План-факт modal (Детали рулонов).
 *
 * Mirrors ReadyStripPrintButton, but the label data is built entirely on the
 * client from the already-loaded manufacture detail + the row — so no extra
 * network request is needed. Prints one 58x40 mm label per roll via
 * StripLabelPrinter (QZ Tray → browser fallback).
 */
export function RollLabelPrintButton({ data }: { data: StripLabelData }) {
    const [printing, setPrinting] = useState(false)

    return (
        <>
            <button
                type="button"
                onClick={() => setPrinting(true)}
                disabled={printing}
                className="inline-flex items-center justify-center gap-1 h-7 px-2.5 rounded-md bg-primary hover:bg-primary/90 text-white text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                title="Печать этикетки"
            >
                <Printer className="w-3.5 h-3.5" />
                Печать
            </button>
            {printing && (
                <StripLabelPrinter
                    data={data}
                    onFinish={() => setPrinting(false)}
                />
            )}
        </>
    )
}
