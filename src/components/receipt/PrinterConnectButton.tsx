/**
 * Printer connection/selection button
 * Allows user to select thermal printer from QZ Tray
 */

import { useState } from "react"
import { getSavedPrinter, listQzPrinters, setSavedPrinter } from "./qzPrint"

interface Props {
    onConnected?: (printerName: string) => void
    className?: string
}

export function PrinterConnectButton({ onConnected, className }: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const [printers, setPrinters] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const currentPrinter = getSavedPrinter()

    const handleOpen = async () => {
        setIsOpen(true)
        setLoading(true)
        setError(null)

        try {
            const availablePrinters = await listQzPrinters()
            setPrinters(availablePrinters)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Printer topilmadi")
        } finally {
            setLoading(false)
        }
    }

    const handleSelect = (printerName: string) => {
        setSavedPrinter(printerName)
        setIsOpen(false)
        onConnected?.(printerName)
    }

    if (!isOpen) {
        return (
            <button onClick={handleOpen} className={className}>
                {currentPrinter ?
                    `Printer: ${currentPrinter}`
                :   "Printerni ulash"}
            </button>
        )
    }

    return (
        <div
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "white",
                padding: "24px",
                borderRadius: "8px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                zIndex: 10000,
                minWidth: "400px",
                maxWidth: "90vw",
            }}
        >
            <h3
                style={{ marginTop: 0, marginBottom: "16px", fontSize: "18px" }}
            >
                Printerni tanlang
            </h3>

            {loading && (
                <div style={{ padding: "12px", textAlign: "center" }}>
                    Yuklanmoqda...
                </div>
            )}

            {error && (
                <div
                    style={{
                        padding: "12px",
                        background: "#fee",
                        border: "1px solid #fcc",
                        borderRadius: "4px",
                        marginBottom: "12px",
                        color: "#c33",
                    }}
                >
                    {error}
                </div>
            )}

            {!loading && printers.length === 0 && !error && (
                <div style={{ padding: "12px", color: "#666" }}>
                    Printer topilmadi
                </div>
            )}

            {!loading && printers.length > 0 && (
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {printers.map((printer) => (
                        <button
                            key={printer}
                            onClick={() => handleSelect(printer)}
                            style={{
                                display: "block",
                                width: "100%",
                                padding: "12px",
                                marginBottom: "8px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                background:
                                    currentPrinter === printer ? "#e3f2fd" : (
                                        "white"
                                    ),
                                cursor: "pointer",
                                textAlign: "left",
                                fontSize: "14px",
                            }}
                        >
                            {printer}
                            {currentPrinter === printer && (
                                <span
                                    style={{ float: "right", color: "#1976d2" }}
                                >
                                    ✓ Tanlangan
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            <div style={{ marginTop: "16px", textAlign: "right" }}>
                <button
                    onClick={() => setIsOpen(false)}
                    style={{
                        padding: "8px 16px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        background: "white",
                        cursor: "pointer",
                    }}
                >
                    Yopish
                </button>
            </div>
        </div>
    )
}
