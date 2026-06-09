/**
 * Render manufacture label to canvas (thermal printer 72mm = 576px)
 * Preserves exact data from backend PDF label
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
    const tempHeight = 1000
    canvas.height = tempHeight

    // Fill white background
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, width, tempHeight)

    // Text styling
    ctx.fillStyle = "#000000"
    ctx.textAlign = "left"
    ctx.textBaseline = "top"

    let y = 20 // Start position

    // Header - bold and larger
    ctx.font = "bold 32px Arial, sans-serif"
    ctx.fillText("INVEST ZONE", 20, y)
    y += 50

    // Body - normal size (20px ~ 8pt for thermal)
    ctx.font = "20px Arial, sans-serif"
    const lineHeight = 28
    const leftMargin = 20

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
        "Gotovaya produkciya:",
        `${data.gotovayaProduktsiya}`,
        `Marka stali: ${data.markaStali}`,
        data.tolshchina != null ?
            `Tolshchina: ${data.tolshchina}mm`
        :   "Tolshchina: -",
    ]

    // Truncate long product names to fit width
    lines.forEach((line, idx) => {
        let textToRender = line
        const maxWidth = width - 40 // margins

        // Check if text exceeds width
        const metrics = ctx.measureText(textToRender)
        if (metrics.width > maxWidth && idx === 8) {
            // Product line - truncate
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

    // Add some bottom padding
    y += 20

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
