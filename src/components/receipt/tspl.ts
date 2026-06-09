/**
 * TSPL (label printer language) encoder
 * Converts canvas to TSPL BITMAP command + base64
 */

export function buildTsplFromCanvas(canvas: HTMLCanvasElement): {
    commands: Uint8Array
    base64: string
} {
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas context unavailable")

    const width = canvas.width
    const height = canvas.height
    const imageData = ctx.getImageData(0, 0, width, height)
    const pixels = imageData.data

    // Convert to monochrome bitmap
    const widthBytes = Math.ceil(width / 8)
    const bytes: number[] = []

    for (let y = 0; y < height; y++) {
        for (let xByte = 0; xByte < widthBytes; xByte++) {
            let byte = 0
            for (let bit = 0; bit < 8; bit++) {
                const x = xByte * 8 + bit
                if (x < width) {
                    const idx = (y * width + x) * 4
                    const r = pixels[idx]
                    const g = pixels[idx + 1]
                    const b = pixels[idx + 2]
                    const brightness = (r + g + b) / 3
                    if (brightness < 127) {
                        // black pixel
                        byte |= 0x80 >> bit
                    }
                }
            }
            bytes.push(byte)
        }
    }

    const bitmapData = new Uint8Array(bytes)
    const base64 = btoa(String.fromCharCode(...bitmapData))

    // TSPL commands
    const widthMm = Math.round((width / 203) * 25.4) // 203 dpi to mm
    const heightMm = Math.round((height / 203) * 25.4)

    const tsplCommands =
        [
            "SIZE " + widthMm + " mm, " + heightMm + " mm",
            "CLS",
            `BITMAP 0,0,${widthBytes},${height},1,${base64}`,
            "PRINT 1",
        ].join("\r\n") + "\r\n"

    const commandBytes = new TextEncoder().encode(tsplCommands)

    return {
        commands: commandBytes,
        base64,
    }
}
