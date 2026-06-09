// Canvas (monoxrom chek) -> ESC/POS raster (GS v 0). ESC/POS termal printerlar uchun.
// Eslatma: ESC/POS'da bit 1 = qora (TSPL'ga teskari).
// Uzun cheklar to'liq chiqishi uchun rasm "band"larga bo'lib yuboriladi.

const BAND_HEIGHT = 256

export const buildEscposFromCanvas = (
    canvas: HTMLCanvasElement,
): Uint8Array => {
    const w = canvas.width
    const h = canvas.height
    const ctx = canvas.getContext("2d")
    const img =
        ctx ?
            ctx.getImageData(0, 0, w, h).data
        :   new Uint8ClampedArray(w * h * 4)

    const widthBytes = Math.ceil(w / 8)
    const raster = new Uint8Array(widthBytes * h) // 0 = oq

    for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
            const idx = (y * w + x) * 4
            const alpha = img[idx + 3]
            const lum =
                0.299 * img[idx] + 0.587 * img[idx + 1] + 0.114 * img[idx + 2]
            if (alpha > 128 && lum < 128) {
                raster[y * widthBytes + (x >> 3)] |= 0x80 >> (x & 7) // qora -> bit 1
            }
        }
    }

    const bytes: number[] = [0x1b, 0x40] // ESC @ -> init

    for (let yStart = 0; yStart < h; yStart += BAND_HEIGHT) {
        const rows = Math.min(BAND_HEIGHT, h - yStart)
        // GS v 0, m=0, xL,xH (bytes/row), yL,yH (rows)
        bytes.push(
            0x1d,
            0x76,
            0x30,
            0x00,
            widthBytes & 0xff,
            (widthBytes >> 8) & 0xff,
            rows & 0xff,
            (rows >> 8) & 0xff,
        )
        const start = yStart * widthBytes
        const end = start + rows * widthBytes
        for (let i = start; i < end; i += 1) bytes.push(raster[i])
    }

    bytes.push(0x0a, 0x0a, 0x0a, 0x0a) // qog'ozni biroz oldinga surish

    return Uint8Array.from(bytes)
}
