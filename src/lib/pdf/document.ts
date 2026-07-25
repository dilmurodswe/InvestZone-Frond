/**
 * A4 hujjatlar uchun jsPDF ustidagi yupqa qatlam.
 *
 * Nega rasm emas, matn: hujjat xaridorga yuboriladi — matn qidiriladigan,
 * nusxa olinadigan va istalgan masshtabda tiniq bo'lishi kerak. Shu sababli
 * kirill harflarini qo'llaydigan TTF shrift PDF ichiga joylanadi (jsPDF'ning
 * standart shriftlari faqat WinAnsi, ya'ni kirill o'rniga savol belgisi).
 */

import { jsPDF } from "jspdf"
import { fetchBase64 } from "./assets"

export const FONT = "Roboto"
export type FontStyle = "normal" | "bold"

const FONT_FILES: Record<FontStyle, string> = {
    normal: "/fonts/Roboto-Regular.ttf",
    bold: "/fonts/Roboto-Bold.ttf",
}

export const A4 = {
    width: 210,
    height: 297,
    margin: 19,
} as const

/** Chegaralar orasidagi foydali kenglik. */
export const CONTENT_WIDTH = A4.width - A4.margin * 2

/** pt → mm (jsPDF `mm` birligida ishlaydi, shrift o'lchami esa punktda). */
export const ptToMm = (pt: number) => (pt * 25.4) / 72

/** Qator balandligi: shrift o'lchamining 1.15 barobari — zich, lekin siqiq emas. */
export const lineHeight = (sizePt: number) => ptToMm(sizePt) * 1.15

export async function createDocument(): Promise<jsPDF> {
    const doc = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true,
    })

    const [regular, bold] = await Promise.all([
        fetchBase64(FONT_FILES.normal),
        fetchBase64(FONT_FILES.bold),
    ])

    doc.addFileToVFS("Roboto-Regular.ttf", regular)
    doc.addFont("Roboto-Regular.ttf", FONT, "normal")
    doc.addFileToVFS("Roboto-Bold.ttf", bold)
    doc.addFont("Roboto-Bold.ttf", FONT, "bold")
    doc.setFont(FONT, "normal")

    return doc
}

export function setFont(doc: jsPDF, sizePt: number, style: FontStyle = "normal") {
    doc.setFont(FONT, style)
    doc.setFontSize(sizePt)
}

export type TextOptions = {
    size?: number
    style?: FontStyle
    /** Matn shu kenglikda o'raladi; berilmasa bitta qatorda qoladi. */
    maxWidth?: number
    align?: "left" | "right" | "center"
    color?: [number, number, number]
}

/** Matn nechta qatorga bo'linishini qaytaradi (chizmasdan). */
export function wrap(
    doc: jsPDF,
    text: string,
    { size = 9, style = "normal", maxWidth }: TextOptions = {},
): string[] {
    setFont(doc, size, style)
    const source = String(text ?? "")
    if (!maxWidth) return source.split("\n")
    return source
        .split("\n")
        .flatMap((line) => doc.splitTextToSize(line, maxWidth) as string[])
}

/** Matnni chizadi va egallagan balandligini (mm) qaytaradi. */
export function drawText(
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    options: TextOptions = {},
): number {
    const { size = 9, style = "normal", align = "left", color } = options
    const lines = wrap(doc, text, options)
    const step = lineHeight(size)

    if (color) doc.setTextColor(...color)
    else doc.setTextColor(0, 0, 0)
    setFont(doc, size, style)

    lines.forEach((line, i) => {
        // jsPDF matnni bazaviy chiziqdan chizadi, biz esa yuqori qirradan
        // hisoblaymiz — shuning uchun bir qator balandligi qo'shiladi.
        doc.text(line, x, y + step * i + ptToMm(size) * 0.82, { align })
    })
    doc.setTextColor(0, 0, 0)

    return step * lines.length
}

/** Matn balandligi — chizmasdan joy hisoblash uchun. */
export function textHeight(
    doc: jsPDF,
    text: string,
    options: TextOptions = {},
): number {
    return wrap(doc, text, options).length * lineHeight(options.size ?? 9)
}

export function rect(
    doc: jsPDF,
    x: number,
    y: number,
    w: number,
    h: number,
    lineWidth = 0.2,
) {
    doc.setLineWidth(lineWidth)
    doc.setDrawColor(0, 0, 0)
    doc.rect(x, y, w, h)
}

export function line(
    doc: jsPDF,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    lineWidth = 0.2,
) {
    doc.setLineWidth(lineWidth)
    doc.setDrawColor(0, 0, 0)
    doc.line(x1, y1, x2, y2)
}

/** Har bir sahifaning yuqori va pastki o'ng burchagiga «1/3» raqamini qo'yadi. */
export function stampPageNumbers(doc: jsPDF) {
    const total = doc.getNumberOfPages()
    for (let page = 1; page <= total; page++) {
        doc.setPage(page)
        const label = `${page}/${total}`
        drawText(doc, label, A4.width - A4.margin, 8, { size: 8, align: "right" })
        drawText(doc, label, A4.width - A4.margin, A4.height - A4.margin + 4, {
            size: 8,
            align: "right",
        })
    }
}
