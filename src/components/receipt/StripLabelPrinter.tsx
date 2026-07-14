/**
 * StripLabelPrinter — prints a single ready-strip label (58 x 40 mm).
 * Tries: QZ Tray → browser print dialog (fallback).
 *
 * Deliberately separate from ManufactureLabelPrinter (the 72 mm "reska"
 * label) so that one stays untouched.
 */

import { useEffect, useRef, useState } from "react"
import { isQzAvailable, printCanvasViaQz } from "./qzPrint"
import { renderStripLabel, type StripLabelData } from "./renderStripLabel"

const LABEL_WIDTH_MM = 58

interface Props {
    data: StripLabelData
    onFinish?: () => void
}

export function StripLabelPrinter({ data, onFinish }: Props) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [status, setStatus] = useState<string>("Tayorlanmoqda...")
    const [hasCanvas, setHasCanvas] = useState(false)
    const printAttempted = useRef(false)

    useEffect(() => {
        if (printAttempted.current) return
        printAttempted.current = true

        const print = async () => {
            try {
                setStatus("Label yaratilmoqda...")
                const canvas = renderStripLabel(data)
                canvasRef.current = canvas
                setHasCanvas(true)

                if (isQzAvailable()) {
                    try {
                        setStatus("QZ Tray orqali chop qilinmoqda...")
                        await printCanvasViaQz(canvas, LABEL_WIDTH_MM)
                        setStatus("Muvaffaqiyatli chop qilindi!")
                        setTimeout(() => onFinish?.(), 500)
                        return
                    } catch (printError) {
                        console.error("QZ print error:", printError)
                        setStatus(
                            `QZ chop xato: ${printError instanceof Error ? printError.message : "Unknown"}`,
                        )
                    }
                }

                // Fallback: browser print dialog
                setStatus("Brauzer print oynasi ochilmoqda...")
                const printWindow = window.open("", "_blank")
                if (printWindow) {
                    printWindow.document.write(`
            <html>
              <head>
                <title>Strip label ${data.zadanieNo}</title>
                <style>
                  @page { size: ${LABEL_WIDTH_MM}mm 40mm; margin: 0; }
                  body { margin: 0; padding: 0; }
                  img { width: ${LABEL_WIDTH_MM}mm; height: auto; display: block; }
                  @media print {
                    body { margin: 0; }
                    img { page-break-after: avoid; }
                  }
                </style>
              </head>
              <body>
                <img src="${canvas.toDataURL()}" />
                <script>
                  window.onload = () => {
                    window.print();
                    setTimeout(() => window.close(), 1000);
                  };
                </script>
              </body>
            </html>
          `)
                    printWindow.document.close()
                    setStatus("Print dialog ochildi")
                } else {
                    setStatus("Brauzer print bloklanadi (popup blocker)")
                }

                setTimeout(() => onFinish?.(), 2000)
            } catch (error) {
                console.error("Print error:", error)
                setStatus(
                    `Xatolik: ${error instanceof Error ? error.message : "Noma'lum xato"}`,
                )
                setTimeout(() => onFinish?.(), 3000)
            }
        }

        print()
    }, [data, onFinish])

    return (
        <div
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "white",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                zIndex: 9999,
                minWidth: "300px",
                textAlign: "center",
            }}
        >
            <div style={{ marginBottom: "12px", fontSize: "14px" }}>
                {status}
            </div>
            {hasCanvas && (
                <div
                    style={{
                        marginTop: "12px",
                        maxWidth: "100%",
                        overflow: "auto",
                    }}
                >
                    <canvas
                        ref={(el) => {
                            if (el && canvasRef.current) {
                                el.width = canvasRef.current.width
                                el.height = canvasRef.current.height
                                const ctx = el.getContext("2d")
                                if (ctx) {
                                    ctx.drawImage(canvasRef.current, 0, 0)
                                }
                            }
                        }}
                        style={{
                            maxWidth: "100%",
                            height: "auto",
                            border: "1px solid #ddd",
                        }}
                    />
                </div>
            )}
        </div>
    )
}
