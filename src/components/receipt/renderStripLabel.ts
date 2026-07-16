/**
 * Render a single READY-STRIP label to canvas for a 58 mm-wide thermal label.
 *
 * Layout is a clean vertical 2-column table (bold field name on the left, the
 * strip's own value right-aligned) — one row per field, so every value prints
 * distinctly. Intentionally separate from renderManufactureLabel (the "reska"
 * label) so that one is never affected.
 */

import type { ManufactureLabelData } from "./types"

export type StripLabelData = ManufactureLabelData

const LABEL_W_MM = 58
const LABEL_H_MM = 74
const DEFAULT_PX_PER_MM = 8 // 203 dpi thermal (8 dots/mm)
const FONT = "Arial, Helvetica, sans-serif"

type Field = { label: string; value: string }

const dash = (v: unknown): string =>
    v === null || v === undefined || v === "" ? "—" : String(v)

function buildFields(data: StripLabelData): Field[] {
    return [
        { label: "Задание №", value: dash(data.zadanieNo) },
        {
            label: "Размер ширина",
            value:
                data.razmerShirina != null ? `${data.razmerShirina} мм` : "—",
        },
        { label: "Партия/Рулон", value: dash(data.partiyaRulon) },
        { label: "Вагон №", value: dash(data.vagonNo) },
        { label: "Плавка", value: dash(data.plavka) },
        { label: "Вес штрипса", value: dash(data.vesShripsa) },
        { label: "Дата резки", value: dash(data.dataRezki) },
        { label: "Готовая продукция", value: dash(data.gotovayaProduktsiya) },
        { label: "Марка стали", value: dash(data.markaStali) },
        {
            label: "Толщина",
            value: data.tolshchina != null ? `${data.tolshchina} мм` : "—",
        },
    ]
}

export function renderStripLabel(
    data: StripLabelData,
    pxPerMm: number = DEFAULT_PX_PER_MM,
): HTMLCanvasElement {
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(LABEL_W_MM * pxPerMm)
    canvas.height = Math.round(LABEL_H_MM * pxPerMm)

    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas context unavailable")

    const mm = (v: number) => v * pxPerMm
    const font = (sizeMm: number, weight = "bold") =>
        `${weight} ${mm(sizeMm).toFixed(2)}px ${FONT}`

    // Background
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "#000000"
    ctx.strokeStyle = "#000000"
    ctx.textBaseline = "middle"

    // Outer border
    ctx.lineWidth = mm(0.5)
    if (typeof ctx.roundRect === "function") {
        ctx.beginPath()
        ctx.roundRect(
            mm(1),
            mm(1),
            mm(LABEL_W_MM - 2),
            mm(LABEL_H_MM - 2),
            mm(2),
        )
        ctx.stroke()
    } else {
        ctx.strokeRect(mm(1), mm(1), mm(LABEL_W_MM - 2), mm(LABEL_H_MM - 2))
    }

    // Header
    ctx.textAlign = "center"
    ctx.textBaseline = "alphabetic"
    ctx.font = font(4.8, "800")
    ctx.fillText("INVEST ZONE", mm(LABEL_W_MM / 2), mm(6.6))
    ctx.font = font(1.7, "600")
    ctx.fillText("ТРУБНЫЙ МЕТАЛЛУРГИЧЕСКИЙ ЗАВОД", mm(LABEL_W_MM / 2), mm(9.2))
    ctx.textBaseline = "middle"

    const innerX0 = 3
    const innerX1 = LABEL_W_MM - 3
    const hLine = (y: number, thickMm: number, x0 = innerX0, x1 = innerX1) => {
        ctx.lineWidth = mm(thickMm)
        ctx.beginPath()
        ctx.moveTo(mm(x0), mm(y))
        ctx.lineTo(mm(x1), mm(y))
        ctx.stroke()
    }

    const fields = buildFields(data)

    // Table geometry — one row per field, then an emphasized quantity row.
    const tableTop = 11
    const qtyRowH = 6
    const tableBottom = LABEL_H_MM - 5.5 // leave room for footer
    const rowsAreaBottom = tableBottom - qtyRowH
    const rowH = (rowsAreaBottom - tableTop) / fields.length

    // Split between label column and value column.
    const splitX = 25
    const padX = 1.4

    hLine(tableTop, 0.35) // top rule

    fields.forEach((field, i) => {
        const top = tableTop + rowH * i
        const midY = top + rowH / 2

        // Row separator (below each row)
        hLine(top + rowH, 0.18)

        // Label (bold)
        ctx.textAlign = "left"
        ctx.font = font(1.95, "700")
        ctx.fillText(field.label, mm(innerX0 + padX), mm(midY))

        // Value (right-aligned, shrink-to-fit)
        const maxW = mm(innerX1 - splitX - padX * 2)
        let sizeMm = 2.4
        const minMm = 1.6
        ctx.font = font(sizeMm, "700")
        while (ctx.measureText(field.value).width > maxW && sizeMm > minMm) {
            sizeMm -= 0.1
            ctx.font = font(sizeMm, "700")
        }
        let text = field.value
        if (ctx.measureText(text).width > maxW) {
            while (
                text.length > 1 &&
                ctx.measureText(text + "…").width > maxW
            ) {
                text = text.slice(0, -1)
            }
            text += "…"
        }
        ctx.textAlign = "right"
        ctx.fillText(text, mm(innerX1 - padX), mm(midY))
    })

    // Vertical column divider across the field rows
    ctx.lineWidth = mm(0.18)
    ctx.beginPath()
    ctx.moveTo(mm(splitX), mm(tableTop))
    ctx.lineTo(mm(splitX), mm(rowsAreaBottom))
    ctx.stroke()

    // Quantity row (emphasized)
    const qtyTop = rowsAreaBottom
    const qtyMidY = qtyTop + qtyRowH / 2
    hLine(qtyTop, 0.35)
    hLine(qtyTop + qtyRowH, 0.35)
    ctx.textAlign = "left"
    ctx.font = font(2.3, "800")
    ctx.fillText("КОЛ-ВО", mm(innerX0 + padX), mm(qtyMidY))
    ctx.textAlign = "right"
    ctx.font = font(3.0, "800")
    const qty = data.quantity != null ? `${data.quantity} шт` : "—"
    ctx.fillText(qty, mm(innerX1 - padX), mm(qtyMidY))

    // Footer
    ctx.textBaseline = "alphabetic"
    ctx.textAlign = "center"
    ctx.font = font(1.7, "700")
    ctx.fillText(
        "ГОСТ 19523-2015   ·   ISO 9001",
        mm(LABEL_W_MM / 2),
        mm(LABEL_H_MM - 1.8),
    )

    return canvas
}
