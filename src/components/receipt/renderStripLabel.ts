/**
 * Render a single READY-STRIP label to canvas for a 58 x 40 mm thermal label.
 *
 * Design mirrors the physical INVEST ZONE tag (bordered header + a bilingual
 * 2-column field grid). It is intentionally separate from renderManufactureLabel
 * (the "reska" / manufacture label, 72 mm) so that one is never affected.
 *
 * Data shape is identical to the manufacture label, but every value here is the
 * strip's OWN (cut width, weight, product, source roll) — so each row prints a
 * distinct label instead of one shared manufacture label.
 */

import type { ManufactureLabelData } from "./types"

export type StripLabelData = ManufactureLabelData

const LABEL_W_MM = 58
const LABEL_H_MM = 40
const DEFAULT_PX_PER_MM = 8 // 203 dpi thermal (8 dots/mm)
const FONT = "Arial, Helvetica, sans-serif"

type Field = { label: string; value: string }

const dash = (v: unknown): string =>
    v === null || v === undefined || v === "" ? "—" : String(v)

function buildColumns(data: StripLabelData): [Field[], Field[]] {
    const left: Field[] = [
        { label: "ЗАДАНИЕ №", value: dash(data.zadanieNo) },
        {
            label: "РАЗМЕР ШИРИНА",
            value:
                data.razmerShirina != null ? `${data.razmerShirina} мм` : "—",
        },
        { label: "ПАРТИЯ/РУЛОН", value: dash(data.partiyaRulon) },
        { label: "ПЛАВКА", value: dash(data.plavka) },
        { label: "ДАТА РЕЗКИ", value: dash(data.dataRezki) },
    ]
    const right: Field[] = [
        { label: "ВАГОН №", value: dash(data.vagonNo) },
        { label: "ВЕС ШТРИПСА", value: dash(data.vesShripsa) },
        {
            label: "ТОЛЩИНА",
            value: data.tolshchina != null ? `${data.tolshchina} мм` : "—",
        },
        { label: "МАРКА СТАЛИ", value: dash(data.markaStali) },
        { label: "ГОТ. ПРОДУКЦИЯ", value: dash(data.gotovayaProduktsiya) },
    ]
    return [left, right]
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
    ctx.textBaseline = "alphabetic"

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
    ctx.font = font(4.6, "800")
    ctx.fillText("INVEST ZONE", mm(LABEL_W_MM / 2), mm(6.4))
    ctx.font = font(1.7, "600")
    ctx.fillText("ТРУБНЫЙ МЕТАЛЛУРГИЧЕСКИЙ ЗАВОД", mm(LABEL_W_MM / 2), mm(8.9))

    // Rule under header
    const innerX0 = 3
    const innerX1 = LABEL_W_MM - 3
    const rule = (y: number, thickMm: number, x0 = innerX0, x1 = innerX1) => {
        ctx.lineWidth = mm(thickMm)
        ctx.beginPath()
        ctx.moveTo(mm(x0), mm(y))
        ctx.lineTo(mm(x1), mm(y))
        ctx.stroke()
    }
    rule(10.2, 0.35)

    // Field grid: 2 columns x 5 rows
    const gridTop = 10.2
    const gridBottom = 36
    const rows = 5
    const rowH = (gridBottom - gridTop) / rows
    const midX = LABEL_W_MM / 2

    // Column divider
    ctx.lineWidth = mm(0.25)
    ctx.beginPath()
    ctx.moveTo(mm(midX), mm(gridTop))
    ctx.lineTo(mm(midX), mm(gridBottom))
    ctx.stroke()

    // Row separators
    for (let i = 1; i < rows; i++) {
        rule(gridTop + rowH * i, 0.2)
    }

    const [leftCol, rightCol] = buildColumns(data)

    // Draw one field cell, shrinking/truncating the value to fit the column.
    const drawCell = (
        field: Field,
        cellX0: number,
        cellX1: number,
        top: number,
    ) => {
        const padX = 1.2
        const x = cellX0 + padX
        const maxW = mm(cellX1 - cellX0 - padX * 2)

        ctx.textAlign = "left"
        ctx.fillStyle = "#000000"

        // Label (small caps)
        ctx.font = font(1.7, "600")
        ctx.fillText(field.label, mm(x), mm(top + 2.0))

        // Value — shrink from 2.7mm down to 1.9mm, then ellipsize
        let sizeMm = 2.7
        const minMm = 1.9
        ctx.font = font(sizeMm)
        while (ctx.measureText(field.value).width > maxW && sizeMm > minMm) {
            sizeMm -= 0.15
            ctx.font = font(sizeMm)
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
        ctx.fillText(text, mm(x), mm(top + 4.5))
    }

    for (let i = 0; i < rows; i++) {
        const top = gridTop + rowH * i
        drawCell(leftCol[i], innerX0, midX, top)
        drawCell(rightCol[i], midX, innerX1, top)
    }

    // Footer: standard + certification
    ctx.textAlign = "center"
    ctx.font = font(1.7, "700")
    ctx.fillText("ГОСТ 19523-2015   ·   ISO 9001", mm(LABEL_W_MM / 2), mm(38.6))

    return canvas
}
