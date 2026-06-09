/**
 * Render manufacture label to canvas (thermal printer 72mm = 576px)
 * Improved design with centered header and larger fonts
 */

import type { ManufactureLabelData } from "./types"

const DEFAULT_WIDTH = 576 // 72mm at 203 dpi

export function renderManufactureLabel(
    data: ManufactureLabelData,
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

    let y = 30 // Start position with more top padding

    // Header - centered, bold and much larger
    ctx.font = "bold 56px Arial, sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("INVEST ZONE", width / 2, y)
    y += 80 // More space after header

    // Body - larger font size for better readability
    ctx.font = "32px Arial, sans-serif"
    ctx.textAlign = "left"
    const lineHeight = 45 // Increased line height
    const leftMargin = 30 // More left margin

    // Render all fields exactly as backend does
    const lines: string[] = [
        `Zadanie #: ${data.zadanieNo}`,
        data.razmerShirina != null ?
            `Razmer shirina: ${data.razmerShirina}mm`
        :   "Razmer shirina: -",
        `Partiya/Rulon: ${data.partiyaRulon || "-"}`,
        `Vagon #: ${data.vagonNo || "-"}`,
        `Plavka: ${data.plavka || "-"}`,
        `Ves shtripsa: ${data.vesShripsa}`,
        `Data rezki: ${data.dataRezki}`,
        "", // Empty line for spacing
        "Gotovaya produkciya:",
        `${data.gotovayaProduktsiya}`,
        "", // Empty line for spacing
        `Marka stali: ${data.markaStali}`,
        data.tolshchina != null ?
            `Tolshchina: ${data.tolshchina}mm`
        :   "Tolshchina: -",
    ]

    // Render lines with word wrap for long product names
    lines.forEach((line, idx) => {
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
            if (idx === 9) {
                // Product line - wrap to multiple lines if needed
                const words = textToRender.split(", ")
                let currentLine = ""

                words.forEach((word) => {
                    const testLine =
                        currentLine + (currentLine ? ", " : "") + word
                    const testMetrics = ctx.measureText(testLine)

                    if (testMetrics.width > maxWidth && currentLine) {
                        ctx.fillText(currentLine, leftMargin, y)
                        y += lineHeight
                        currentLine = word
                    } else {
                        currentLine = testLine
                    }
                })

                if (currentLine) {
                    ctx.fillText(currentLine, leftMargin, y)
                    y += lineHeight
                }
                return
            } else {
                // Other lines - truncate with ellipsis
                while (
                    ctx.measureText(textToRender + "...").width > maxWidth &&
                    textToRender.length > 10
                ) {
                    textToRender = textToRender.slice(0, -1)
                }
                textToRender += "..."
            }
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
