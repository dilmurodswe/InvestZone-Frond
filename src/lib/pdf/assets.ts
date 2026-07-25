/**
 * Chop etish uchun kerak bo'ladigan og'ir aktivlar (shrift, logo) — faqat
 * hujjat yasalganda yuklanadi va keyin keshda qoladi, shuning uchun ular
 * asosiy bundle'ga tushmaydi.
 */

/** ~500 KB fayl uchun `String.fromCharCode(...bytes)` stack'ni to'ldiradi. */
const CHUNK = 0x8000

function toBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ""
    for (let i = 0; i < bytes.length; i += CHUNK) {
        binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
    }
    return btoa(binary)
}

const cache = new Map<string, Promise<string>>()

/** Aktivni base64 ko'rinishida oladi; bir marta yuklanadi. */
export function fetchBase64(url: string): Promise<string> {
    const hit = cache.get(url)
    if (hit) return hit

    const task = fetch(url)
        .then((res) => {
            if (!res.ok) throw new Error(`${url}: ${res.status}`)
            return res.arrayBuffer()
        })
        .then(toBase64)
        .catch((err) => {
            // Keshda muvaffaqiyatsiz va'da qolib ketmasin — keyingi urinish
            // qaytadan so'rov yuborsin.
            cache.delete(url)
            throw err
        })

    cache.set(url, task)
    return task
}
