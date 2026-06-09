// Canvas (monoxrom chek) -> TSPL `BITMAP` buyrug'i. XP-365B label printeri uchun.

/** Canvas'ni TSPL BITMAP buyrug'iga aylantiradi (1 bit = 1 nuqta, 0 = qora). */
export const buildTsplFromCanvas = (
    canvas: HTMLCanvasElement,
    widthMm: number,
): Uint8Array => {
    const w = canvas.width
    const h = canvas.height
    const ctx = canvas.getContext("2d")
    const img =
        ctx ?
            ctx.getImageData(0, 0, w, h).data
        :   new Uint8ClampedArray(w * h * 4)

    const widthBytes = Math.ceil(w / 8)
    const bitmap = new Uint8Array(widthBytes * h).fill(0xff) // 1 = oq (bosilmaydi)

    for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
            const idx = (y * w + x) * 4
            const alpha = img[idx + 3]
            const lum =
                0.299 * img[idx] + 0.587 * img[idx + 1] + 0.114 * img[idx + 2]
            if (alpha > 128 && lum < 128) {
                const byteIdx = y * widthBytes + (x >> 3)
                bitmap[byteIdx] &= ~(0x80 >> (x & 7)) // qora nuqta -> bit 0
            }
        }
    }

    const heightMm = Math.ceil(h / 8) + 3
    const enc = (s: string) => new TextEncoder().encode(s)
    const header = enc(
        `SIZE ${widthMm} mm,${heightMm} mm\r\nGAP 0 mm,0 mm\r\nDIRECTION 1\r\nREFERENCE 0,0\r\nCLS\r\n` +
            `BITMAP 0,0,${widthBytes},${h},0,`,
    )
    const footer = enc("\r\nPRINT 1,1\r\n")

    const out = new Uint8Array(header.length + bitmap.length + footer.length)
    out.set(header, 0)
    out.set(bitmap, header.length)
    out.set(footer, header.length + bitmap.length)

    return out
}

/** Uint8Array -> base64 (QZ Tray raw uchun). */
export const uint8ToBase64 = (bytes: Uint8Array): string => {
    let binary = ""
    const chunk = 0x8000
    for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode.apply(
            null,
            Array.from(bytes.subarray(i, i + chunk)),
        )
    }

    return btoa(binary)
}
