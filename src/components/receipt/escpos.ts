/**
 * ESC/POS raster image encoder
 * Converts canvas to ESC/POS GS v 0 commands (band-by-band)
 */

const BAND_HEIGHT = 24 // pixels per band (must be multiple of 8 for XP-365B)

export function buildEscposFromCanvas(canvas: HTMLCanvasElement): Uint8Array {
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas context unavailable")

    const width = canvas.width
    const height = canvas.height
    const imageData = ctx.getImageData(0, 0, width, height)
    const pixels = imageData.data

    // Convert to monochrome bitmap (1 = white, 0 = black for ESC/POS)
    const mono: boolean[][] = []
    for (let y = 0; y < height; y++) {
        const row: boolean[] = []
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4
            const r = pixels[idx]
            const g = pixels[idx + 1]
            const b = pixels[idx + 2]
            const brightness = (r + g + b) / 3
            row.push(brightness > 127) // true = white, false = black
        }
        mono.push(row)
    }

    const commands: number[] = []

    // ESC @ — reset printer
    commands.push(0x1b, 0x40)

    // Process image in bands
    for (let bandY = 0; bandY < height; bandY += BAND_HEIGHT) {
        const bandHeightActual = Math.min(BAND_HEIGHT, height - bandY)
        const bandBytes = getBandBytes(mono, width, bandY, bandHeightActual)

        // GS v 0 m xL xH yL yH d1...dk
        // m=0 (normal), xL xH = width in bytes, yL yH = band height
        const widthBytes = Math.ceil(width / 8)
        const xL = widthBytes & 0xff
        const xH = (widthBytes >> 8) & 0xff
        const yL = bandHeightActual & 0xff
        const yH = (bandHeightActual >> 8) & 0xff

        commands.push(0x1d, 0x76, 0x30, 0x00) // GS v 0 m (m=0)
        commands.push(xL, xH, yL, yH)
        commands.push(...bandBytes)
    }

    // LF — line feed to advance paper
    commands.push(0x0a)
    commands.push(0x0a)
    commands.push(0x0a)

    // Cut paper (if supported) — GS V m (m=1 partial cut)
    commands.push(0x1d, 0x56, 0x01)

    return new Uint8Array(commands)
}

function getBandBytes(
    mono: boolean[][],
    width: number,
    startY: number,
    bandHeight: number,
): number[] {
    const widthBytes = Math.ceil(width / 8)
    const bytes: number[] = []

    for (let y = 0; y < bandHeight; y++) {
        const row = mono[startY + y] || []
        for (let xByte = 0; xByte < widthBytes; xByte++) {
            let byte = 0
            for (let bit = 0; bit < 8; bit++) {
                const x = xByte * 8 + bit
                const isWhite = x < width ? row[x] : true
                if (!isWhite) {
                    // black pixel → set bit (0x80 >> bit)
                    byte |= 0x80 >> bit
                }
            }
            bytes.push(byte)
        }
    }

    return bytes
}
