/**
 * Prokatka/Prokatka yorlig'ini chop etish oynasi.
 *
 * Oqim: tugma bosiladi → bu modal ochiladi (har pachka uchun to'ldirilgan
 * yorliq preview'i) → "Chop etish" bosilganda brauzerning printer tanlash
 * oynasi chiqadi → tanlangan printerga chiqadi. Qog'oz oldindan bosilgan
 * bo'lgani uchun chop etishda faqat ma'lumot (matn + QR) chiqadi.
 */

import { useEffect, useMemo, useState } from "react"
import {
    buildPrintDocument,
    labelStyles,
    renderPackLabelHtml,
} from "./renderRollingLabelHtml"
import { buildQrPayload, makeQrDataUrl } from "./rollingLabelQr"
import type { RollingLabelData } from "./types"

type Props = {
    data: RollingLabelData
    onFinish?: () => void
}

export function RollingLabelPrinter({ data, onFinish }: Props) {
    const [qrUrls, setQrUrls] = useState<string[] | null>(null)
    const [active, setActive] = useState(0)
    const [error, setError] = useState<string | null>(null)

    const packs = data.packs?.length ? data.packs : []

    // Har bir pachka uchun QR rasm (data-URL) tayyorlash
    useEffect(() => {
        let cancelled = false
        ;(async () => {
            try {
                const urls = await Promise.all(
                    packs.map((p) => makeQrDataUrl(buildQrPayload(data, p))),
                )
                if (!cancelled) setQrUrls(urls)
            } catch (e) {
                if (!cancelled) setError(`QR yaratishda xatolik: ${e}`)
            }
        })()
        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data])

    // Har bir pachka yorlig'ining HTML'i
    const labelsHtml = useMemo(() => {
        if (!qrUrls) return []
        return packs.map((p, i) => renderPackLabelHtml(data, p, qrUrls[i]))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qrUrls, data])

    const doPrint = (indexes: number[]) => {
        if (!labelsHtml.length) return
        const selected = indexes.map((i) => labelsHtml[i]).filter(Boolean)
        const doc = buildPrintDocument(selected)

        const iframe = document.createElement("iframe")
        iframe.style.position = "fixed"
        iframe.style.right = "0"
        iframe.style.bottom = "0"
        iframe.style.width = "0"
        iframe.style.height = "0"
        iframe.style.border = "0"

        const cleanup = () => {
            setTimeout(() => iframe.remove(), 1000)
        }

        iframe.onload = () => {
            const win = iframe.contentWindow
            if (!win) return cleanup()
            // QR rasm(lar) yuklanib bo'lishini kutamiz, keyin print dialog
            setTimeout(() => {
                win.focus()
                win.print()
                cleanup()
            }, 200)
        }

        iframe.srcdoc = doc
        document.body.appendChild(iframe)
    }

    const printAll = () => doPrint(packs.map((_, i) => i))
    const printCurrent = () => doPrint([active])

    // Preview uchun bitta yorliqning HTML'i (yo'riqchi bilan)
    const previewHtml = useMemo(() => {
        if (!qrUrls || !packs[active]) return ""
        return renderPackLabelHtml(data, packs[active], qrUrls[active])
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qrUrls, active, data])

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                backgroundColor: "rgba(0,0,0,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem",
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onFinish?.()
            }}
        >
            <div
                style={{
                    backgroundColor: "white",
                    padding: "1.25rem",
                    borderRadius: "0.75rem",
                    maxWidth: 460,
                    width: "100%",
                    maxHeight: "92vh",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.85rem",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontSize: "1.1rem",
                            fontWeight: 700,
                        }}
                    >
                        Prokatka yorlig'i · Plan {data.planNumber}
                    </h2>
                    <span style={{ fontSize: "0.8rem", color: "#666" }}>
                        {packs.length} pachka
                    </span>
                </div>

                {error && (
                    <p style={{ margin: 0, color: "#dc2626", fontSize: 13 }}>
                        {error}
                    </p>
                )}

                {/* Preview */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        overflow: "auto",
                        background: "#f3f4f6",
                        borderRadius: "0.5rem",
                        padding: "1rem",
                        maxHeight: "60vh",
                    }}
                >
                    {previewHtml ?
                        <div
                            style={{
                                transform: "scale(0.9)",
                                transformOrigin: "top center",
                                boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
                            }}
                        >
                            <style>{labelStyles()}</style>
                            <div
                                // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
                                dangerouslySetInnerHTML={{
                                    __html: previewHtml,
                                }}
                            />
                        </div>
                    :   <p
                            style={{
                                fontSize: 13,
                                color: "#666",
                                padding: "2rem",
                            }}
                        >
                            Yorliq tayyorlanmoqda…
                        </p>
                    }
                </div>

                {/* Pachka navigatsiyasi */}
                {packs.length > 1 && (
                    <div
                        style={{
                            display: "flex",
                            gap: 6,
                            flexWrap: "wrap",
                            justifyContent: "center",
                        }}
                    >
                        {packs.map((p, i) => (
                            <button
                                // eslint-disable-next-line react-x/no-array-index-key
                                key={`${p.packNumber}-${i}`}
                                onClick={() => setActive(i)}
                                style={{
                                    padding: "3px 10px",
                                    borderRadius: 6,
                                    border: "1px solid #d1d5db",
                                    background:
                                        i === active ? "#2563eb" : "#fff",
                                    color: i === active ? "#fff" : "#111",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                №{p.packNumber}
                            </button>
                        ))}
                    </div>
                )}

                {/* Amallar */}
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        onClick={() => onFinish?.()}
                        style={{
                            flex: "0 0 auto",
                            padding: "0.6rem 1rem",
                            background: "#f3f4f6",
                            color: "#111",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.5rem",
                            cursor: "pointer",
                            fontWeight: 600,
                        }}
                    >
                        Yopish
                    </button>
                    {packs.length > 1 && (
                        <button
                            onClick={printCurrent}
                            disabled={!labelsHtml.length}
                            style={{
                                flex: 1,
                                padding: "0.6rem 1rem",
                                background: "#fff",
                                color: "#2563eb",
                                border: "1px solid #2563eb",
                                borderRadius: "0.5rem",
                                cursor: "pointer",
                                fontWeight: 700,
                                opacity: labelsHtml.length ? 1 : 0.5,
                            }}
                        >
                            Shu pachka
                        </button>
                    )}
                    <button
                        onClick={printAll}
                        disabled={!labelsHtml.length}
                        style={{
                            flex: 1,
                            padding: "0.6rem 1rem",
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            borderRadius: "0.5rem",
                            cursor: "pointer",
                            fontWeight: 700,
                            opacity: labelsHtml.length ? 1 : 0.5,
                        }}
                    >
                        Chop etish{packs.length > 1 ? ` (${packs.length})` : ""}
                    </button>
                </div>
            </div>
        </div>
    )
}
