/**
 * Prokatka yorlig'i (INVEST ZONE birka) o'lchamlari va o'zgarmas matnlari.
 * Qog'oz oldindan bosilgan — biz faqat ma'lumotni bo'sh joyga joylashtiramiz.
 *
 * Fizik birka: 80mm (eni) × 130mm (bo'yi), portret.
 *
 * MUHIM — koordinatalar tizimi:
 * Quyidagi barcha o'lchamlar QOG'OZ ko'rinishida (birka to'g'ri o'qiladigan
 * holatda: yuqorida teshik + INVEST ZONE shapkasi, pastda STZ logotipi).
 * Printerga chiqishda butun birka `rotate180` orqali aylantiriladi.
 */

// Yorliq o'lchami (mm)
export const LABEL_WIDTH_MM = 80
export const LABEL_HEIGHT_MM = 130

/**
 * Oldindan bosilgan zonalar (qog'oz ko'rinishida):
 *  - HEADER_RESERVED_MM: yuqorida teshik + INVEST ZONE logotipi/manzil/QR bloki.
 *  - FOOTER_RESERVED_MM: pastda STZ logotipi.
 *  - LEFT/RIGHT_PADDING_MM: qizil ramkadan ichkariga chekinish.
 *
 * DIQQAT: chekinish kalibrovka siljishidan KATTA bo'lishi shart, aks holda
 * siljitilgan matn sahifa chekkasidan chiqib kesiladi (|offsetXMm| ≤ padding).
 */
export const HEADER_RESERVED_MM = 32
export const FOOTER_RESERVED_MM = 12
export const LEFT_PADDING_MM = 5
export const RIGHT_PADDING_MM = 5

/** QR tomoni (mm) — birka pastida, chap tomonda. */
export const QR_SIZE_MM = 14

/** Sertifikatning o'ng chekinishi — STZ logotipiga tegmasligi uchun (mm). */
export const CERT_RIGHT_INSET_MM = 15

/**
 * Pastdagi o'zgarmas sertifikat matnlari (yorliqda + QR payload'ida).
 * Maket bo'yicha ular qizil ramka ichidagi chop etiladigan zonaga kiradi —
 * qog'ozda oldindan bosilgani faqat logotip, manzil va STZ belgisi.
 */
export const LABEL_CERTIFICATIONS = [
    "ISO 9001:2015-000351/A/176-12-25",
    "UZTR.319-004:2015",
] as const

/**
 * Printer kalibrovkasi — chop etilgan ma'lumot qog'ozga to'g'ri tushishi uchun.
 * Faqat CHOP ETISHDA qo'llanadi (ekrandagi preview har doim "ideal" holatni
 * ko'rsatadi), chunki bu printerning fizik siljishini kompensatsiya qiladi.
 *
 *  - offsetXMm: musbat = O'NGGA, manfiy = CHAPGA (qog'oz ko'rinishida).
 *  - offsetYMm: musbat = PASTGA, manfiy = YUQORIGA (qog'oz ko'rinishida).
 *  - rotate180: birkani 180° aylantirib chop etish (qog'oz teskari kelsa).
 *  - pageHeightMm: PDF sahifasining balandligi = printer bir birka uchun
 *      suradigan qog'oz uzunligi. Birka tanasi 130mm, lekin perforatsiya
 *      tufayli qadam biroz kattaroq. Agar keyingi birka har safar pastga
 *      surilib borsa — bu qiymatni oshiring; yuqoriga sursa — kamaytiring.
 *      Yorliq har doim sahifaning tepasiga chiziladi, ortiqchasi bo'sh qoladi.
 */
export type LabelCalibration = {
    offsetXMm: number
    offsetYMm: number
    rotate180: boolean
    pageHeightMm: number
}

export const DEFAULT_CALIBRATION: LabelCalibration = {
    offsetXMm: 0,
    offsetYMm: 0,
    rotate180: true,
    pageHeightMm: LABEL_HEIGHT_MM,
}

/** Sahifa balandligi chegarasi (mm). */
export const PAGE_HEIGHT_RANGE_MM = { min: LABEL_HEIGHT_MM, max: 160 }

/**
 * Siljish chegaralari: bundan oshsa matn sahifadan chiqib kesiladi.
 * Chegara nosimmetrik, chunki ma'lumot bloki ham birkaning o'rtasida emas:
 * tepada 32mm (shapka), pastda 12mm (STZ) bo'sh joy bor.
 */
export const OFFSET_X_RANGE_MM = {
    min: -LEFT_PADDING_MM,
    max: RIGHT_PADDING_MM,
}
export const OFFSET_Y_RANGE_MM = {
    min: -HEADER_RESERVED_MM,
    max: FOOTER_RESERVED_MM,
}

const clampTo = (v: number, r: { min: number; max: number }) =>
    Math.max(r.min, Math.min(r.max, v))

export const NO_CALIBRATION: LabelCalibration = {
    offsetXMm: 0,
    offsetYMm: 0,
    rotate180: false,
    pageHeightMm: LABEL_HEIGHT_MM,
}

// v2 — maket qayta o'lchangani uchun eski saqlangan qiymatlar bekor qilindi
const STORAGE_KEY = "iz.rollingLabel.calibration.v2"

/** Saqlangan kalibrovkani o'qiydi (bo'lmasa — standart qiymatlar). */
export function loadCalibration(): LabelCalibration {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return DEFAULT_CALIBRATION
        const parsed = JSON.parse(raw) as Partial<LabelCalibration>
        return {
            offsetXMm:
                typeof parsed.offsetXMm === "number" ?
                    clampTo(parsed.offsetXMm, OFFSET_X_RANGE_MM)
                :   DEFAULT_CALIBRATION.offsetXMm,
            offsetYMm:
                typeof parsed.offsetYMm === "number" ?
                    clampTo(parsed.offsetYMm, OFFSET_Y_RANGE_MM)
                :   DEFAULT_CALIBRATION.offsetYMm,
            rotate180:
                typeof parsed.rotate180 === "boolean" ?
                    parsed.rotate180
                :   DEFAULT_CALIBRATION.rotate180,
            pageHeightMm:
                typeof parsed.pageHeightMm === "number" ?
                    clampTo(parsed.pageHeightMm, PAGE_HEIGHT_RANGE_MM)
                :   DEFAULT_CALIBRATION.pageHeightMm,
        }
    } catch {
        return DEFAULT_CALIBRATION
    }
}

export function saveCalibration(cal: LabelCalibration): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cal))
    } catch {
        // localStorage o'chirilgan bo'lsa — jim o'tkazamiz
    }
}
