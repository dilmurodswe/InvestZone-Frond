/**
 * Prokatka yorlig'ini chop etish oynasi.
 *
 * Oqim: tugma bosiladi → bu modal ochiladi (har pachka uchun to'ldirilgan
 * yorliq preview'i) → "Chop etish" bosilganda 80×130mm PDF yasaladi va
 * brauzerning PDF ko'ruvchisida chop etish oynasi ochiladi.
 *
 * Preview va PDF bitta chizuvchidan (`drawRollingLabel`) chiqadi, shuning uchun
 * ekranda ko'rgan narsangiz aynan qog'ozga tushadi.
 */

import { useEffect, useMemo, useRef, useState } from "react"
import { drawRollingLabel } from "./drawRollingLabel"
import {
    DEFAULT_CALIBRATION,
    END_TRIM_RANGE_MM,
    NO_CALIBRATION,
    OFFSET_X_RANGE_MM,
    OFFSET_Y_RANGE_MM,
    PITCH_RANGE_MM,
    loadCalibration,
    saveCalibration,
} from "./rollingLabelConstants"
import { buildLabelsPdf } from "./rollingLabelPdf"
import { buildCalibrationPdf } from "./rollingLabelTestSheet"
import type { RollingLabelData } from "./types"

type Props = {
    data: RollingLabelData
    onFinish?: () => void
}

/** Bitta kalibrovka o'qi: −1mm / qiymat / +1mm. */
function OffsetField({
    label,
    hint,
    value,
    range,
    onChange,
}: {
    label: string
    hint: string
    value: number
    range: { min: number; max: number }
    onChange: (v: number) => void
}) {
    const clamp = (v: number) => Math.max(range.min, Math.min(range.max, v))
    const btn = {
        width: 28,
        height: 28,
        borderRadius: 6,
        border: "1px solid #d1d5db",
        background: "#fff",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
    } as const

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}
                >
                    {label}
                </div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>{hint}</div>
            </div>
            <button
                type="button"
                style={btn}
                onClick={() => onChange(clamp(value - 1))}
            >
                −
            </button>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(clamp(Number(e.target.value) || 0))}
                style={{
                    width: 58,
                    height: 28,
                    textAlign: "center",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                }}
            />
            <button
                type="button"
                style={btn}
                onClick={() => onChange(clamp(value + 1))}
            >
                +
            </button>
        </div>
    )
}

/** Ekrandagi preview — kalibrovkasiz, oldindan bosilgan qog'oz bilan. */
function LabelPreview({
    data,
    packIndex,
}: {
    data: RollingLabelData
    packIndex: number
}) {
    const holder = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const node = holder.current
        const pack = data.packs[packIndex]
        if (!node || !pack) return

        const canvas = drawRollingLabel({
            data,
            pack,
            pxPerMm: 8,
            guide: true,
            calibration: NO_CALIBRATION,
        })
        canvas.style.width = "260px"
        canvas.style.height = "auto"
        canvas.style.display = "block"
        canvas.style.boxShadow = "0 4px 14px rgba(0,0,0,0.18)"

        node.replaceChildren(canvas)
    }, [data, packIndex])

    return <div ref={holder} />
}

export function RollingLabelPrinter({ data, onFinish }: Props) {
    const [active, setActive] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [cal, setCal] = useState(loadCalibration)
    const [showCal, setShowCal] = useState(false)

    useEffect(() => {
        saveCalibration(cal)
    }, [cal])

    const packs = useMemo(() => data.packs ?? [], [data])

    const openPdf = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob)
        const win = window.open(url, "_blank")
        if (!win) {
            // Popup bloklangan bo'lsa — yuklab olishga tushamiz
            const a = document.createElement("a")
            a.href = url
            a.download = filename
            a.click()
        }
        setTimeout(() => URL.revokeObjectURL(url), 60_000)
    }

    const doPrint = (indexes: number[]) => {
        try {
            const blob = buildLabelsPdf(
                data,
                indexes.map((i) => packs[i]),
                cal,
            )
            openPdf(blob, `yorliq-${data.planNumber}.pdf`)
        } catch (e) {
            setError(`PDF yasashda xatolik: ${e}`)
        }
    }

    /** Millimetrli shkala — printerning xom xatosini o'lchash uchun. */
    const printRuler = () => {
        try {
            openPdf(buildCalibrationPdf(cal), "kalibrovka.pdf")
        } catch (e) {
            setError(`O'lchagich yasashda xatolik: ${e}`)
        }
    }

    const printAll = () => doPrint(packs.map((_, i) => i))
    const printCurrent = () => doPrint([active])
    const ready = packs.length > 0

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
                    overflowY: "auto",
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

                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        background: "#f3f4f6",
                        borderRadius: "0.5rem",
                        padding: "1rem",
                    }}
                >
                    {ready ?
                        <LabelPreview data={data} packIndex={active} />
                    :   <p
                            style={{
                                fontSize: 13,
                                color: "#666",
                                padding: "2rem",
                            }}
                        >
                            Pachka topilmadi
                        </p>
                    }
                </div>

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

                {/* Printer kalibrovkasi */}
                <div
                    style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        padding: "0.6rem 0.75rem",
                    }}
                >
                    <button
                        onClick={() => setShowCal((v) => !v)}
                        style={{
                            all: "unset",
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#374151",
                        }}
                    >
                        {showCal ? "▾" : "▸"} Printer kalibrovkasi
                        {cal.rotate180 ? " · 180°" : ""} · X {cal.offsetXMm} · Y{" "}
                        {cal.offsetYMm} · qadam {cal.pitchMm} · oxiri −
                        {cal.endTrimMm}mm
                    </button>

                    {showCal && (
                        <div
                            style={{
                                marginTop: "0.6rem",
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                            }}
                        >
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 11,
                                    lineHeight: 1.4,
                                    color: "#6b7280",
                                }}
                            >
                                Faqat chop etishda qo'llanadi. Qog'ozda ma'lumot
                                chapga siljigan bo'lsa X'ni oshiring, yuqoriga
                                siljigan bo'lsa Y'ni oshiring.
                            </p>

                            <OffsetField
                                label="Gorizontal (X)"
                                hint={`− chapga / + o'ngga · ${OFFSET_X_RANGE_MM.min}…+${OFFSET_X_RANGE_MM.max}mm`}
                                value={cal.offsetXMm}
                                range={OFFSET_X_RANGE_MM}
                                onChange={(offsetXMm) =>
                                    setCal((c) => ({ ...c, offsetXMm }))
                                }
                            />
                            <OffsetField
                                label="Vertikal (Y)"
                                hint={`− yuqoriga / + pastga · ${OFFSET_Y_RANGE_MM.min}…+${OFFSET_Y_RANGE_MM.max}mm`}
                                value={cal.offsetYMm}
                                range={OFFSET_Y_RANGE_MM}
                                onChange={(offsetYMm) =>
                                    setCal((c) => ({ ...c, offsetYMm }))
                                }
                            />

                            <OffsetField
                                label="Birka qadami"
                                hint="keyingi birka pastga sursa — kamaytiring"
                                value={cal.pitchMm}
                                range={PITCH_RANGE_MM}
                                onChange={(pitchMm) =>
                                    setCal((c) => ({ ...c, pitchMm }))
                                }
                            />
                            <OffsetField
                                label="Oxirgi ortiqcha qog'oz"
                                hint="chop etgach qancha ortiqcha chiqsa — shuncha"
                                value={cal.endTrimMm}
                                range={END_TRIM_RANGE_MM}
                                onChange={(endTrimMm) =>
                                    setCal((c) => ({ ...c, endTrimMm }))
                                }
                            />

                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: "#374151",
                                    cursor: "pointer",
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={cal.rotate180}
                                    onChange={(e) =>
                                        setCal((c) => ({
                                            ...c,
                                            rotate180: e.target.checked,
                                        }))
                                    }
                                />
                                180° aylantirib chop etish (teskari chiqsa)
                            </label>

                            <div style={{ display: "flex", gap: 6 }}>
                                <button
                                    onClick={printRuler}
                                    style={{
                                        padding: "4px 10px",
                                        borderRadius: 6,
                                        border: "1px solid #2563eb",
                                        background: "#fff",
                                        color: "#2563eb",
                                        fontSize: 11,
                                        fontWeight: 700,
                                        cursor: "pointer",
                                    }}
                                >
                                    O'lchagichni chop etish
                                </button>
                                <button
                                    onClick={() => setCal(DEFAULT_CALIBRATION)}
                                    style={{
                                        padding: "4px 10px",
                                        borderRadius: 6,
                                        border: "1px solid #d1d5db",
                                        background: "#fff",
                                        fontSize: 11,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                    }}
                                >
                                    Standart qiymatlar
                                </button>
                            </div>

                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 11,
                                    lineHeight: 1.4,
                                    color: "#6b7280",
                                }}
                            >
                                O'lchagich birkaga millimetrli shkala bosadi.
                                «0» birka tanasining boshiga tushishi kerak;
                                qayerga tushgan bo'lsa, o'shancha mm ni Y ga
                                teskari ishora bilan yozing. 2-varaqdagi «0» esa
                                haqiqiy qadamni ko'rsatadi.
                            </p>

                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 11,
                                    lineHeight: 1.4,
                                    color: "#b45309",
                                }}
                            >
                                Chop etish oynasida «Masshtab / Масштаб / Scale»
                                — <strong>100% (Actual size)</strong> bo'lsin,
                                «Fit to printable area» emas.
                            </p>
                        </div>
                    )}
                </div>

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
                            disabled={!ready}
                            style={{
                                flex: 1,
                                padding: "0.6rem 1rem",
                                background: "#fff",
                                color: "#2563eb",
                                border: "1px solid #2563eb",
                                borderRadius: "0.5rem",
                                cursor: "pointer",
                                fontWeight: 700,
                                opacity: ready ? 1 : 0.5,
                            }}
                        >
                            Shu pachka
                        </button>
                    )}
                    <button
                        onClick={printAll}
                        disabled={!ready}
                        style={{
                            flex: 1,
                            padding: "0.6rem 1rem",
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            borderRadius: "0.5rem",
                            cursor: "pointer",
                            fontWeight: 700,
                            opacity: ready ? 1 : 0.5,
                        }}
                    >
                        Chop etish{packs.length > 1 ? ` (${packs.length})` : ""}
                    </button>
                </div>
            </div>
        </div>
    )
}
