/**
 * Yorliqlardan PDF yasab, chop etish oynasini ochadi.
 *
 * Ikkita muhim qaror:
 *
 * 1. HTML emas, PDF. Brauzerning HTML chop etishida "Kolontitullar" yoqilgan
 *    bo'lsa Chrome `@page { margin: 0 }` ni bekor qiladi va sahifani suradi.
 *    PDF chop etishda bunday sozlama yo'q.
 *
 * 2. Har bir birka alohida sahifa EMAS — hammasi BITTA uzun sahifada, aniq
 *    qadam bilan. Alohida sahifalarda oraliqni printerning qog'oz surishi
 *    belgilaydi va u perforatsiya qadamiga to'g'ri kelmagani uchun xato
 *    birkadan birkaga to'planib borardi. Bitta sahifada oraliqni biz
 *    belgilaymiz, sahifa esa aynan oxirgi birkaning oxirida tugaydi —
 *    shuning uchun ortiqcha qog'oz chiqmaydi.
 */

import { jsPDF } from "jspdf"
import { drawRollingLabel } from "./drawRollingLabel"
import {
    LABEL_HEIGHT_MM,
    LABEL_WIDTH_MM,
    maxEndTrimMm,
    type LabelCalibration,
} from "./rollingLabelConstants"
import type { RollingLabelData, RollingPackData } from "./types"

/** Chop etish sifati: 300 dpi (termal printerlar 203–300 dpi). */
const PRINT_DPI = 300
const PX_PER_MM = PRINT_DPI / 25.4

/**
 * Sahifa balandligi: oxirgi birka tanasining oxirida tugaydi, minus printer
 * chop etishdan keyin o'zi suradigan ortiqcha qog'oz (`endTrimMm`).
 *
 * Qisqartirilgan qism — birka 180° aylantirilgani uchun — uning bo'sh shapka
 * zonasiga to'g'ri keladi, shuning uchun hech qanday ma'lumot kesilmaydi.
 */
export function pdfHeightMm(
    packCount: number,
    pitchMm: number,
    endTrimMm = 0,
): number {
    return Math.max(0, packCount - 1) * pitchMm + LABEL_HEIGHT_MM - endTrimMm
}

export function buildLabelsPdf(
    data: RollingLabelData,
    packs: RollingPackData[],
    calibration: LabelCalibration,
): Blob {
    const pitch = Math.max(calibration.pitchMm, LABEL_HEIGHT_MM)
    const trim = Math.min(
        calibration.endTrimMm,
        maxEndTrimMm(calibration.offsetYMm),
    )
    const pageHeight = pdfHeightMm(packs.length, pitch, trim)

    const doc = new jsPDF({
        unit: "mm",
        format: [LABEL_WIDTH_MM, pageHeight],
        orientation: "portrait",
        compress: true,
    })

    packs.forEach((pack, i) => {
        const canvas = drawRollingLabel({
            data,
            pack,
            pxPerMm: PX_PER_MM,
            guide: false,
            calibration,
        })

        doc.addImage(
            canvas.toDataURL("image/png"),
            "PNG",
            0,
            i * pitch,
            LABEL_WIDTH_MM,
            LABEL_HEIGHT_MM,
        )
    })

    // PDF ochilishi bilan chop etish oynasi chiqsin
    doc.autoPrint()
    return doc.output("blob")
}
