/**
 * Prokatka yorlig'ini canvas'ga chizadi — millimetr koordinatalarida.
 *
 * Nega canvas + PDF, HTML emas: brauzerning HTML chop etishida "Kolontitullar"
 * yoqilgan bo'lsa Chrome `@page { margin: 0 }` ni bekor qiladi, sahifani
 * kichraytiradi va suradi — yorliq qo'shni birkaga sirpanib ketadi. PDF chop
 * etishda bunday sozlama umuman yo'q, shuning uchun natija barqaror.
 *
 * Barcha koordinatalar QOG'OZ ko'rinishida (birka to'g'ri o'qiladigan holat:
 * yuqorida teshik + INVEST ZONE shapkasi, pastda STZ logotipi). Printerga
 * chiqishda `rotate180` butun birkani aylantiradi.
 */

import { drawCode128 } from "./code128"
import { buildBarcodePayload, metersFromMm } from "./rollingLabelBarcode"
import {
    BARCODE_HEIGHT_MM,
    BARCODE_WIDTH_MM,
    CERT_RIGHT_INSET_MM,
    FOOTER_RESERVED_MM,
    HEADER_RESERVED_MM,
    LABEL_CERTIFICATIONS,
    LABEL_HEIGHT_MM,
    LABEL_WIDTH_MM,
    LEFT_PADDING_MM,
    RIGHT_PADDING_MM,
    type LabelCalibration,
} from "./rollingLabelConstants"
import type { RollingLabelData, RollingPackData } from "./types"

/** `en` bo'sh bo'lsa qator bir satrli bo'ladi (maketdagi ДАТА kabi). */
type FieldRow = { en: string; ru: string; values: string[] }

function buildRows(data: RollingLabelData, pack: RollingPackData): FieldRow[] {
    // Maketda SPECIFICATION va СТАНДАРТ НТД alohida qiymatlar
    // (ГОСТ 13663-86 / ГОСТ 8639-82). Bittasi bo'lsa — bitta qiymat chiqadi.
    const standards =
        data.specification && data.specification !== data.standard ?
            [data.specification, data.standard]
        :   [data.specification || data.standard]

    return [
        { en: "", ru: "ДАТА", values: [data.productionDate] },
        {
            en: "TUBE SIZE, MM",
            ru: "РАЗМЕР ТРУБЫ, ММ",
            values: [data.tubeSize],
        },
        { en: "SPECIFICATION", ru: "СТАНДАРТ НТД", values: standards },
        { en: "STEEL GRADE", ru: "МАРКА СТАЛИ", values: [data.steelGrade] },
        { en: "BATCH No.", ru: "ПАРТИЯ №", values: [data.planNumber] },
        { en: "PACK No.", ru: "ПАЧКА №", values: [pack.packNumber] },
        {
            en: "LENGTH, M",
            ru: "ДЛИНА, М",
            values: [metersFromMm(data.length)],
        },
        {
            en: "TOTAL LENGTH, M",
            ru: "ОБЩАЯ ДЛИНА, М",
            values: [data.totalLength != null ? String(data.totalLength) : "—"],
        },
    ]
}

const FONT = "Arial, Helvetica, sans-serif"

// Shrift o'lchamlari (mm) — maketdagi birkaga moslangan
const LABEL_FONT_MM = 3.0
const VALUE_FONT_MM = 4.2
const VALUE_FONT_DUAL_MM = 3.6
const CERT_FONT_MM = 2.1

/** Pastdagi blok: shtrix-kod + sertifikat qatori. */
const FOOTER_BAND_MM = BARCODE_HEIGHT_MM + 5

export type DrawOptions = {
    data: RollingLabelData
    pack: RollingPackData
    /** Nuqta/mm — 300 dpi uchun 11.81. */
    pxPerMm: number
    /** Oldindan bosilgan qog'ozni xira ko'rsatish (faqat ekran preview'i). */
    guide: boolean
    calibration: LabelCalibration
}

/** Bitta yorliqni tayyor canvas qilib qaytaradi. */
export function drawRollingLabel(opts: DrawOptions): HTMLCanvasElement {
    const { data, pack, pxPerMm, guide, calibration } = opts

    const canvas = document.createElement("canvas")
    canvas.width = Math.round(LABEL_WIDTH_MM * pxPerMm)
    canvas.height = Math.round(LABEL_HEIGHT_MM * pxPerMm)

    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas 2d konteksti mavjud emas")

    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const mm = (v: number) => v * pxPerMm
    const font = (sizeMm: number, weight = "bold") =>
        `${weight} ${mm(sizeMm).toFixed(2)}px ${FONT}`

    if (guide) drawGuide(ctx, mm)

    ctx.save()
    if (calibration.rotate180) {
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate(Math.PI)
        ctx.translate(-canvas.width / 2, -canvas.height / 2)
    }
    ctx.translate(mm(calibration.offsetXMm), mm(calibration.offsetYMm))

    drawContent(
        ctx,
        mm,
        font,
        buildRows(data, pack),
        buildBarcodePayload(data, pack),
    )
    ctx.restore()

    return canvas
}

/** Chop etiladigan ma'lumot: qatorlar + shtrix-kod + sertifikatlar. */
function drawContent(
    ctx: CanvasRenderingContext2D,
    mm: (v: number) => number,
    font: (sizeMm: number, weight?: string) => string,
    rows: FieldRow[],
    barcodeText: string,
) {
    const x0 = LEFT_PADDING_MM
    const x1 = LABEL_WIDTH_MM - RIGHT_PADDING_MM
    const y0 = HEADER_RESERVED_MM
    const y1 = LABEL_HEIGHT_MM - FOOTER_RESERVED_MM

    const fieldsBottom = y1 - FOOTER_BAND_MM
    const rowHeight = (fieldsBottom - y0) / rows.length

    ctx.fillStyle = "#000"
    ctx.strokeStyle = "#000"

    const rule = (y: number, thickMm: number) => {
        ctx.lineWidth = mm(thickMm)
        ctx.beginPath()
        ctx.moveTo(mm(x0), mm(y))
        ctx.lineTo(mm(x1), mm(y))
        ctx.stroke()
    }

    rule(y0, 0.4)

    rows.forEach((row, i) => {
        const top = y0 + rowHeight * i
        // Ikki satrli qator: EN tepada, RU pastda; qiymat RU satriga tekislanadi.
        // Bir satrli qator (ДАТА): matn ham qiymat ham pastki satrda.
        const enBaseline = top + 3.7
        const ruBaseline = top + 7.4

        ctx.textAlign = "left"
        ctx.font = font(LABEL_FONT_MM)
        if (row.en) ctx.fillText(row.en, mm(x0), mm(enBaseline))
        ctx.fillText(row.ru, mm(x0), mm(ruBaseline))

        ctx.textAlign = "right"
        if (row.values.length > 1) {
            ctx.font = font(VALUE_FONT_DUAL_MM)
            ctx.fillText(row.values[0], mm(x1), mm(enBaseline))
            ctx.fillText(row.values[1], mm(x1), mm(ruBaseline))
        } else {
            ctx.font = font(VALUE_FONT_MM)
            ctx.fillText(row.values[0], mm(x1), mm(ruBaseline))
        }

        rule(top + rowHeight, 0.25)
    })

    drawCode128(
        ctx,
        barcodeText,
        mm(x0),
        mm(fieldsBottom + 1.5),
        mm(BARCODE_WIDTH_MM),
        mm(BARCODE_HEIGHT_MM),
    )

    // Sertifikatlar: chapda ISO, o'ngda UZTR.
    // O'ng chekinish — oldindan bosilgan STZ logotipiga tegmasligi uchun.
    ctx.font = font(CERT_FONT_MM, "600")
    ctx.textAlign = "left"
    ctx.fillText(LABEL_CERTIFICATIONS[0], mm(x0), mm(y1 - 0.3))
    ctx.textAlign = "right"
    ctx.fillText(
        LABEL_CERTIFICATIONS[1],
        mm(x1 - CERT_RIGHT_INSET_MM),
        mm(y1 - 0.3),
    )
}

/** Oldindan bosilgan qog'ozning xira ko'rinishi — faqat ekran preview'i uchun. */
function drawGuide(ctx: CanvasRenderingContext2D, mm: (v: number) => number) {
    const w = LABEL_WIDTH_MM
    const h = LABEL_HEIGHT_MM

    ctx.save()
    ctx.strokeStyle = "rgba(220, 38, 38, 0.30)"
    ctx.lineWidth = mm(2.5)
    ctx.beginPath()
    ctx.roundRect(mm(1.25), mm(1.25), mm(w - 2.5), mm(h - 2.5), mm(3))
    ctx.stroke()

    // Osma teshik (D6)
    ctx.strokeStyle = "rgba(0, 0, 0, 0.18)"
    ctx.lineWidth = mm(0.4)
    ctx.beginPath()
    ctx.arc(mm(w / 2), mm(8), mm(3), 0, Math.PI * 2)
    ctx.stroke()

    ctx.textAlign = "center"
    ctx.fillStyle = "rgba(0, 0, 0, 0.16)"
    ctx.font = `800 ${mm(6)}px ${FONT}`
    ctx.fillText("INVEST ZONE", mm(w / 2), mm(19))
    ctx.fillStyle = "rgba(220, 38, 38, 0.30)"
    ctx.font = `700 ${mm(2.2)}px ${FONT}`
    ctx.fillText("ТРУБНЫЙ МЕТАЛЛУРГИЧЕСКИЙ ЗАВОД", mm(w / 2), mm(23))

    // STZ logotipi (pastda o'ngda)
    ctx.strokeStyle = "rgba(37, 99, 235, 0.30)"
    ctx.fillStyle = "rgba(37, 99, 235, 0.30)"
    ctx.lineWidth = mm(0.4)
    ctx.beginPath()
    ctx.arc(mm(w - 11), mm(h - 9), mm(5), 0, Math.PI * 2)
    ctx.stroke()
    ctx.font = `700 ${mm(3)}px ${FONT}`
    ctx.fillText("STZ", mm(w - 11), mm(h - 8))
    ctx.restore()
}
