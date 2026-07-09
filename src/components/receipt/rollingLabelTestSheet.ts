/**
 * Kalibrovka o'lchagichi — printerning qog'ozga qanday bosayotganini
 * suratdan emas, raqam bilan aniqlash uchun.
 *
 * Birkaning ustiga millimetrli shkala chizadi. Chop etilgandan keyin:
 *  - "0" belgisi birka tanasining boshiga to'g'ri kelsa — vertikal siljish yo'q.
 *    Aks holda "0" qayerga tushgani = offsetY uchun tuzatma.
 *  - "130" belgisi tananing oxiriga to'g'ri kelsa — masshtab 100%.
 *  - Ikkinchi varaqdagi "0" qayerga tushgani = birka qadami (pitch).
 *
 * Shkala kalibrovkasiz (siljishsiz) chiziladi — printerning xom xatosi ko'rinsin.
 */

import { jsPDF } from "jspdf"
import {
    LABEL_HEIGHT_MM,
    LABEL_WIDTH_MM,
    type LabelCalibration,
} from "./rollingLabelConstants"
import { pdfHeightMm } from "./rollingLabelPdf"

const PRINT_DPI = 300
const PX_PER_MM = PRINT_DPI / 25.4
const FONT = "Arial, Helvetica, sans-serif"

/** Bitta birka o'lchamidagi shkala canvas'i. */
function drawRuler(index: number, rotate180: boolean): HTMLCanvasElement {
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(LABEL_WIDTH_MM * PX_PER_MM)
    canvas.height = Math.round(LABEL_HEIGHT_MM * PX_PER_MM)

    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas 2d konteksti mavjud emas")
    const mm = (v: number) => v * PX_PER_MM

    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (rotate180) {
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate(Math.PI)
        ctx.translate(-canvas.width / 2, -canvas.height / 2)
    }

    ctx.fillStyle = "#000"
    ctx.strokeStyle = "#000"

    // Har 10mm da uzun chiziq + raqam, har 5mm da qisqa chiziq
    for (let y = 0; y <= LABEL_HEIGHT_MM; y += 5) {
        const long = y % 10 === 0
        ctx.lineWidth = mm(long ? 0.4 : 0.25)
        ctx.beginPath()
        ctx.moveTo(mm(3), mm(y))
        ctx.lineTo(mm(long ? 18 : 10), mm(y))
        ctx.stroke()

        if (long) {
            ctx.font = `bold ${mm(3.5).toFixed(2)}px ${FONT}`
            ctx.textAlign = "left"
            ctx.textBaseline = "middle"
            ctx.fillText(String(y), mm(20), mm(y))
        }
    }

    // Ma'lumot bloki qayerda turishi kerakligini ko'rsatuvchi ramka (32…118mm)
    ctx.lineWidth = mm(0.5)
    ctx.setLineDash([mm(2), mm(2)])
    ctx.strokeRect(mm(5), mm(32), mm(LABEL_WIDTH_MM - 10), mm(86))
    ctx.setLineDash([])

    ctx.textAlign = "center"
    ctx.textBaseline = "alphabetic"
    ctx.font = `bold ${mm(5).toFixed(2)}px ${FONT}`
    ctx.fillText(`VARAQ ${index + 1}`, mm(LABEL_WIDTH_MM / 2), mm(75))
    ctx.font = `bold ${mm(3).toFixed(2)}px ${FONT}`
    ctx.fillText("0 = tana boshi", mm(LABEL_WIDTH_MM / 2), mm(82))

    return canvas
}

/** Ikkita birkalik o'lchagich (qadamni ham tekshirish uchun). */
export function buildCalibrationPdf(calibration: LabelCalibration): Blob {
    const pitch = Math.max(calibration.pitchMm, LABEL_HEIGHT_MM)
    const count = 2

    const doc = new jsPDF({
        unit: "mm",
        format: [LABEL_WIDTH_MM, pdfHeightMm(count, pitch)],
        orientation: "portrait",
        compress: true,
    })

    for (let i = 0; i < count; i++) {
        doc.addImage(
            drawRuler(i, calibration.rotate180).toDataURL("image/png"),
            "PNG",
            0,
            i * pitch,
            LABEL_WIDTH_MM,
            LABEL_HEIGHT_MM,
        )
    }

    doc.autoPrint()
    return doc.output("blob")
}
