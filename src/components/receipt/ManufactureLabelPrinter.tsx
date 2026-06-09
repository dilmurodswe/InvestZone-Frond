/**
 * ManufactureLabelPrinter component
 * Automatically prints manufacture label via thermal printer
 * Tries: QZ Tray → Web Serial → Browser print dialog (fallback)
 */

import { useEffect, useRef, useState } from "react"
import { isQZAvailable, printCanvas } from "./qzPrint"
import { renderManufactureLabel } from "./renderManufactureLabel"
import type { ManufactureLabelData } from "./types"
import {
    isSerialConnected,
    isWebSerialAvailable,
    printCanvasSerial,
} from "./webSerialPrint"

interface Props {
    data: ManufactureLabelData
    onFinish?: () => void
}

export function ManufactureLabelPrinter({ data, onFinish }: Props) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [status, setStatus] = useState<string>("Tayorlanmoqda...")
    const [hasCanvas, setHasCanvas] = useState(false)
    const printAttempted = useRef(false)

    useEffect(() => {
        if (printAttempted.current) return
        printAttempted.current = true

        const print = async () => {
            try {
                // 1. Render to canvas
                setStatus("Label yaratilmoqda...")
                const canvas = renderManufactureLabel(data)
                canvasRef.current = canvas
                setHasCanvas(true)

                // 2. Try QZ Tray first
                if (await isQZAvailable()) {
                    setStatus("QZ Tray orqali chop qilinmoqda...")
                    await printCanvas(canvas)
                    setStatus("Muvaffaqiyatli chop qilindi!")
                    setTimeout(() => onFinish?.(), 500)
                    return
                }

                // 3. Try Web Serial
                if (isWebSerialAvailable() && isSerialConnected()) {
                    setStatus("Serial port orqali chop qilinmoqda...")
                    await printCanvasSerial(canvas)
                    setStatus("Muvaffaqiyatli chop qilindi!")
                    setTimeout(() => onFinish?.(), 500)
                    return
                }

                // 4. Fallback: browser print dialog
                setStatus("Brauzer print oynasi ochilmoqda...")
                const printWindow = window.open("", "_blank")
                if (printWindow) {
                    printWindow.document.write(`
            <html>
              <head>
                <title>Label ${data.zadanieNo}</title>
                <style>
                  body { margin: 0; padding: 0; }
                  img { width: 100%; height: auto; }
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
                }

                setStatus("Print dialog ochildi")
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
