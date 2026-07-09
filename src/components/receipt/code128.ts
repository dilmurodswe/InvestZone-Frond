/**
 * Code 128 (B to'plami) shtrix-kod kodlovchisi.
 *
 * Yorliqdagi shtrix-kod maketdagidek chiziqli bo'lishi kerak. Chiziqli kod
 * faqat ASCII belgilarni va cheklangan uzunlikni ko'taradi (~50mm kenglikda
 * 15-20 belgi), shuning uchun unga to'liq ma'lumot emas, qisqa kalit yoziladi.
 */

/** Har bir qiymat uchun 6 ta chiziq/bo'shliq kengligi (stop — 7 ta). */
const PATTERNS = [
    "212222",
    "222122",
    "222221",
    "121223",
    "121322",
    "131222",
    "122213",
    "122312",
    "132212",
    "221213",
    "221312",
    "231212",
    "112232",
    "122132",
    "122231",
    "113222",
    "123122",
    "123221",
    "223211",
    "221132",
    "221231",
    "213212",
    "223112",
    "312131",
    "311222",
    "321122",
    "321221",
    "312212",
    "322112",
    "322211",
    "212123",
    "212321",
    "232121",
    "111323",
    "131123",
    "131321",
    "112313",
    "132113",
    "132311",
    "211313",
    "231113",
    "231311",
    "112133",
    "112331",
    "132131",
    "113123",
    "113321",
    "133121",
    "313121",
    "211331",
    "231131",
    "213113",
    "213311",
    "213131",
    "311123",
    "311321",
    "331121",
    "312113",
    "312311",
    "332111",
    "314111",
    "221411",
    "431111",
    "111224",
    "111422",
    "121124",
    "121421",
    "141122",
    "141221",
    "112214",
    "112412",
    "122114",
    "122411",
    "142112",
    "142211",
    "241211",
    "221114",
    "413111",
    "241112",
    "134111",
    "111242",
    "121142",
    "121241",
    "114212",
    "124112",
    "124211",
    "411212",
    "421112",
    "421211",
    "212141",
    "214121",
    "412121",
    "111143",
    "111341",
    "131141",
    "114113",
    "114311",
    "411113",
    "411311",
    "113141",
    "114131",
    "311141",
    "411131",
    "211412",
    "211214",
    "211232",
    "2331112",
]

const START_B = 104
const STOP = 106

/** Code 128 B faqat ASCII 32..126 ni qo'llab-quvvatlaydi. */
export function toCode128Ascii(text: string): string {
    return [...text]
        .map((c) => {
            const code = c.charCodeAt(0)
            return code >= 32 && code <= 126 ? c : "?"
        })
        .join("")
}

/**
 * Matnni modul kengliklariga aylantiradi.
 * Natija: [chiziq, bo'shliq, chiziq, ...] — birinchisi har doim qora chiziq.
 */
export function encodeCode128B(text: string): number[] {
    const ascii = toCode128Ascii(text)
    const values = [...ascii].map((c) => c.charCodeAt(0) - 32)

    let checksum = START_B
    values.forEach((v, i) => {
        checksum += v * (i + 1)
    })
    checksum %= 103

    const codes = [START_B, ...values, checksum, STOP]
    return codes.flatMap((code) => [...PATTERNS[code]].map(Number))
}

/** Kodning umumiy moduli soni (kenglikni hisoblash uchun). */
export function code128Modules(text: string): number {
    return encodeCode128B(text).reduce((a, b) => a + b, 0)
}

/**
 * Shtrix-kodni canvas'ga chizadi. Chiziqlar butun pikselga tekislanadi —
 * aks holda termal printerda chiziqlar "yuvilib" o'qilmay qoladi.
 */
export function drawCode128(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
) {
    const widths = encodeCode128B(text)
    const total = widths.reduce((a, b) => a + b, 0)
    const module = width / total

    ctx.save()
    ctx.fillStyle = "#000"
    let cursor = x
    widths.forEach((w, i) => {
        const barWidth = w * module
        if (i % 2 === 0) {
            const left = Math.round(cursor)
            const right = Math.round(cursor + barWidth)
            ctx.fillRect(left, Math.round(y), Math.max(1, right - left), height)
        }
        cursor += barWidth
    })
    ctx.restore()
}
