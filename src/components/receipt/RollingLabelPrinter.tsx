/**
 * Rolling/Prokatka Label Printer Component
 * Displays rolling label in modal and handles thermal printing via QZ Tray
 */

import { useEffect, useMemo, useState } from "react"
import { isQzAvailable, printCanvasViaQz } from "./qzPrint"
import { renderRollingLabel } from "./renderRollingLabel"
import type { RollingLabelData } from "./types"

type Props = {
    data: RollingLabelData
    onFinish?: () => void
}

export function RollingLabelPrinter({ data, onFinish }: Props) {
    const [status, setStatus] = useState<string>("Label yaratilmoqda...")

    // Render label to canvas
    const canvas = useMemo(() => renderRollingLabel(data), [data])

    useEffect(() => {
        if (!canvas) return

        const doPrint = async () => {
            const qzAvailable = isQzAvailable()
            if (qzAvailable) {
                try {
                    setStatus("QZ Tray orqali chop qilinmoqda...")
                    await printCanvasViaQz(canvas, 72)
                    setStatus("Muvaffaqiyatli chop qilindi!")
                    setTimeout(() => onFinish?.(), 500)
                    return
                } catch (printError) {
                    console.error("QZ print xatolik:", printError)
                    setStatus(`QZ xatolik: ${printError}`)
                    // Fall back to browser print
                }
            }

            // Fallback: browser print dialog
            setStatus("Brauzer chop oynasi ochilmoqda...")
            const tempImg = document.createElement("img")
            tempImg.src = canvas.toDataURL()
            tempImg.style.maxWidth = "100%"

            const printWin = window.open("", "_blank")
            if (printWin) {
                printWin.document.write(`
                    <html>
                      <head><title>Rolling Label</title></head>
                      <body style="margin:0; display:flex; justify-content:center; align-items:center;">
                        ${tempImg.outerHTML}
                      </body>
                    </html>
                `)
                printWin.document.close()
                printWin.print()
                setTimeout(() => {
                    printWin.close()
                    onFinish?.()
                }, 500)
            } else {
                setStatus("Oyna ochib bo'lmadi.")
            }
        }

        doPrint()
    }, [canvas, onFinish])

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onFinish?.()
            }}
        >
            <div
                style={{
                    backgroundColor: "white",
                    padding: "2rem",
                    borderRadius: "0.5rem",
                    minWidth: 400,
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                }}
            >
                <h2 style={{ margin: 0, fontSize: "1.25rem" }}>
                    Rolling Label
                </h2>

                {canvas && (
                    <div
                        style={{
                            maxWidth: "100%",
                            maxHeight: "60vh",
                            overflow: "auto",
                            border: "1px solid #ddd",
                        }}
                    >
                        <img
                            src={canvas.toDataURL()}
                            alt="Rolling Label"
                            style={{ display: "block", maxWidth: "100%" }}
                        />
                    </div>
                )}

                <p style={{ margin: 0, fontSize: "0.875rem", color: "#666" }}>
                    {status}
                </p>

                <button
                    onClick={() => onFinish?.()}
                    style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "0.25rem",
                        cursor: "pointer",
                    }}
                >
                    Yopish
                </button>
            </div>
        </div>
    )
}
