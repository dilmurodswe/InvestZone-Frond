/**
 * Yorliqlardan PDF yasab, chop etish oynasini ochadi.
 *
 * HTML chop etishdan farqi: PDF'da brauzerning "Kolontitullar" va "Chetlari"
 * sozlamalari yo'q, shuning uchun sahifa aynan 80×130mm bo'lib qoladi va
 * ma'lumot qo'shni birkaga sirpanmaydi.
 */

import { jsPDF } from "jspdf"
import { drawRollingLabel } from "./drawRollingLabel"
import {
    LABEL_HEIGHT_MM,
    LABEL_WIDTH_MM,
    type LabelCalibration,
} from "./rollingLabelConstants"
import type { RollingLabelData, RollingPackData } from "./types"

/** Chop etish sifati: 300 dpi (termal printerlar 203–300 dpi). */
const PRINT_DPI = 300
const PX_PER_MM = PRINT_DPI / 25.4

export function buildLabelsPdf(
    data: RollingLabelData,
    packs: RollingPackData[],
    qrImages: (CanvasImageSource | null)[],
    calibration: LabelCalibration,
): Blob {
    // Sahifa birkadan uzunroq bo'lishi mumkin (perforatsiya qadamiga moslash
    // uchun) — yorliq har doim sahifaning tepasiga chiziladi.
    const pageHeight = Math.max(calibration.pageHeightMm, LABEL_HEIGHT_MM)

    const doc = new jsPDF({
        unit: "mm",
        format: [LABEL_WIDTH_MM, pageHeight],
        orientation: "portrait",
        compress: true,
    })

    packs.forEach((pack, i) => {
        if (i > 0) doc.addPage([LABEL_WIDTH_MM, pageHeight], "portrait")

        const canvas = drawRollingLabel({
            data,
            pack,
            qr: qrImages[i] ?? null,
            pxPerMm: PX_PER_MM,
            guide: false,
            calibration,
        })

        doc.addImage(
            canvas.toDataURL("image/png"),
            "PNG",
            0,
            0,
            LABEL_WIDTH_MM,
            LABEL_HEIGHT_MM,
        )
    })

    // PDF ochilishi bilan chop etish oynasi chiqsin
    doc.autoPrint()
    return doc.output("blob")
}

/** QR data-URL'ni canvas chiza oladigan rasmga aylantiradi. */
export function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error("QR rasmini yuklab bo'lmadi"))
        img.src = src
    })
}
