/**
 * Render rolling/prokatka label to canvas (thermal printer 72mm = 576px)
 * Design matching tube manufacturing labels with UZBEKISTON header
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
    const tempHeight = 1400
    canvas.height = tempHeight

    // Fill white background
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, width, tempHeight)

    // Text styling
    ctx.fillStyle = "#000000"
    ctx.textBaseline = "top"

    let y = 30 // Start position with top padding

    // Header - UZBEKISTON - centered, bold and large
    ctx.font = "bold 56px Arial, sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("UZBEKISTON", width / 2, y)
    y += 80 // Space after header

    // Body - larger font size for better readability
    ctx.font = "32px Arial, sans-serif"
    ctx.textAlign = "left"
    const lineHeight = 45 // Line height
    const leftMargin = 30 // Left margin

    // Render all fields
    const lines: string[] = [
        `Plan #: ${data.planNumber}`,
        `Razmer: ${data.tubeSize}`,
        `Partiya: ${data.batchNumber}`,
        `Dlina: ${data.length}mm`,
        "", // Empty line for spacing
        `Marka stali: ${data.steelGrade}`,
        `Standart: ${data.standard}`,
        "", // Empty line for spacing
        `Data: ${data.productionDate}`,
        `Master: ${data.master}`,
        `Smena: ${data.smena}`,
        "", // Empty line for spacing
        "PACHKALAR:", // Packs header
    ]

    // Add each pack
    data.packs.forEach((pack, idx) => {
        lines.push(`${idx + 1}. ${pack.packNumber}`)
        lines.push(`   Ves: ${pack.weightTn}t`)
        lines.push(`   Soni: ${pack.quantity}`)
        if (idx < data.packs.length - 1) {
            lines.push("") // Empty line between packs
        }
    })

    // Render lines
    lines.forEach((line) => {
        if (line === "") {
            // Empty line - just add spacing
            y += lineHeight * 0.5
            return
        }

        let textToRender = line
        const maxWidth = width - leftMargin * 2 // margins on both sides

        // Check if text exceeds width
        const metrics = ctx.measureText(textToRender)
        if (metrics.width > maxWidth) {
            // Truncate with ellipsis
            while (
                ctx.measureText(textToRender + "...").width > maxWidth &&
                textToRender.length > 10
            ) {
                textToRender = textToRender.slice(0, -1)
            }
            textToRender += "..."
        }

        ctx.fillText(textToRender, leftMargin, y)
        y += lineHeight
    })

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
