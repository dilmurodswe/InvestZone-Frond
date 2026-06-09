/**
 * Render rolling/prokatka label to canvas (thermal printer 72mm = 576px)
 * Professional design with INVEST ZONE branding and red accents
 */

import type { RollingLabelData } from "./types"

const DEFAULT_WIDTH = 576 // 72mm at 203 dpi

export function renderRollingLabel(
    data: RollingLabelData,
    width: number = DEFAULT_WIDTH,
): HTMLCanvasElement {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas context unavailable")

    canvas.width = width

    // Initial height estimate (will adjust at end)
    const tempHeight = 2000
    canvas.height = tempHeight

    // Fill white background
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, width, tempHeight)

    let y = 20 // Start position

    // Red top border
    ctx.fillStyle = "#DC2626"
    ctx.fillRect(0, 0, width, 8)
    y += 15

    // MADE IN UZBEKISTAN - top right
    ctx.font = "12px Arial, sans-serif"
    ctx.fillStyle = "#666666"
    ctx.textAlign = "right"
    ctx.fillText("MADE IN", width - 20, y)
    ctx.fillText("UZBEKISTAN", width - 20, y + 15)
    y += 35

    // INVEST ZONE header with red accent
    ctx.font = "bold 48px Arial, sans-serif"
    ctx.fillStyle = "#000000"
    ctx.textAlign = "left"
    const leftMargin = 20
    ctx.fillText("INVEST ZONE", leftMargin, y)
    y += 55

    // Red underline under INVEST ZONE
    ctx.fillStyle = "#DC2626"
    ctx.fillRect(leftMargin, y - 5, 180, 3)

    // Subtitle
    ctx.font = "14px Arial, sans-serif"
    ctx.fillStyle = "#666666"
    ctx.fillText("TRUBNYJ METALLURGICHESKIJ ZAVOD", leftMargin, y + 5)
    y += 35

    // Main content with labels and values
    ctx.fillStyle = "#000000"
    const lineHeight = 50
    const labelFont = "bold 24px Arial, sans-serif"
    const valueFont = "28px Arial, sans-serif"
    const valueX = width - leftMargin

    // Helper function to draw label-value pair
    const drawField = (label: string, value: string) => {
        ctx.font = labelFont
        ctx.textAlign = "left"
        ctx.fillText(label, leftMargin, y)

        ctx.font = valueFont
        ctx.textAlign = "right"
        ctx.fillText(value, valueX, y)
        y += lineHeight
    }

    // Red separator line
    ctx.fillStyle = "#DC2626"
    ctx.fillRect(leftMargin, y, width - leftMargin * 2, 2)
    y += 25

    ctx.fillStyle = "#000000"

    // Main fields
    drawField("DATA", data.productionDate)
    drawField("TUBE SIZE, MM", data.tubeSize)
    drawField("RAZMER TRUBY, MM", data.tubeSize)
    drawField("STANDARD", data.standard)
    drawField("STANDART HTД", data.standard)
    drawField("STEEL GRADE", data.steelGrade)
    drawField("MARKA STALI", data.steelGrade)

    y += 10
    ctx.fillStyle = "#DC2626"
    ctx.fillRect(leftMargin, y, width - leftMargin * 2, 2)
    y += 25
    ctx.fillStyle = "#000000"

    drawField("BATCH NO.", data.batchNumber)
    drawField("PARTIYA №", `Plan ${data.planNumber}`)
    drawField("LENGTH, M", `${(data.length / 1000).toFixed(1)}`)
    drawField("DLINA, M", `${(data.length / 1000).toFixed(1)}`)

    y += 10
    ctx.fillStyle = "#DC2626"
    ctx.fillRect(leftMargin, y, width - leftMargin * 2, 2)
    y += 25
    ctx.fillStyle = "#000000"

    // Packs section
    ctx.font = "bold 26px Arial, sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("PACHKALAR:", leftMargin, y)
    y += 45

    data.packs.forEach((pack, idx) => {
        ctx.font = "bold 24px Arial, sans-serif"
        ctx.fillText(`${idx + 1}. ${pack.packNumber}`, leftMargin + 10, y)
        y += 40

        drawField("  Ves:", `${pack.weightTn}t`)
        drawField("  Soni:", `${pack.quantity}`)

        if (idx < data.packs.length - 1) {
            y += 15
        }
    })

    y += 20

    // Bottom section
    ctx.fillStyle = "#DC2626"
    ctx.fillRect(leftMargin, y, width - leftMargin * 2, 2)
    y += 25
    ctx.fillStyle = "#000000"

    drawField("Master:", data.master)
    drawField("Smena:", data.smena)

    y += 30

    // QR code placeholder area
    const qrSize = 100
    const qrX = (width - qrSize) / 2
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 2
    ctx.strokeRect(qrX, y, qrSize, qrSize)
    ctx.font = "12px Arial, sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("QR CODE", width / 2, y + qrSize + 15)
    y += qrSize + 30

    // Add bottom padding
    y += 40

    // Adjust canvas height to actual content
    const finalHeight = y
    const finalCanvas = document.createElement("canvas")
    const finalCtx = finalCanvas.getContext("2d")
    if (!finalCtx) throw new Error("Final canvas context unavailable")

    finalCanvas.width = width
    finalCanvas.height = finalHeight

    // Copy content to final canvas
    finalCtx.drawImage(canvas, 0, 0)

    return finalCanvas
}
