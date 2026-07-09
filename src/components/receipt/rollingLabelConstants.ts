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
 */
export const HEADER_RESERVED_MM = 32
export const FOOTER_RESERVED_MM = 14
export const LEFT_PADDING_MM = 6
export const RIGHT_PADDING_MM = 6

/**
 * Sertifikat matni qog'ozda ALLAQACHON bosilgan (INVEST ZONE shapkasi ichida).
 * Shu sabab uni qayta chop etmaymiz — aks holda ustma-ust tushadi.
 * Ma'lumot QR ichida baribir saqlanadi.
 */
export const SHOW_CERT_TEXT = false

/** Pastdagi o'zgarmas sertifikat matnlari (QR payload'i uchun). */
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
 *
 * Foydalanuvchi bu qiymatlarni chop etish oynasidan o'zgartira oladi;
 * tanlovi brauzerda saqlanadi.
 */
export type LabelCalibration = {
    offsetXMm: number
    offsetYMm: number
    rotate180: boolean
}

export const DEFAULT_CALIBRATION: LabelCalibration = {
    offsetXMm: -7,
    offsetYMm: -15,
    rotate180: true,
}

export const NO_CALIBRATION: LabelCalibration = {
    offsetXMm: 0,
    offsetYMm: 0,
    rotate180: false,
}

const STORAGE_KEY = "iz.rollingLabel.calibration"

/** Saqlangan kalibrovkani o'qiydi (bo'lmasa — standart qiymatlar). */
export function loadCalibration(): LabelCalibration {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return DEFAULT_CALIBRATION
        const parsed = JSON.parse(raw) as Partial<LabelCalibration>
        return {
            offsetXMm:
                typeof parsed.offsetXMm === "number" ?
                    parsed.offsetXMm
                :   DEFAULT_CALIBRATION.offsetXMm,
            offsetYMm:
                typeof parsed.offsetYMm === "number" ?
                    parsed.offsetYMm
                :   DEFAULT_CALIBRATION.offsetYMm,
            rotate180:
                typeof parsed.rotate180 === "boolean" ?
                    parsed.rotate180
                :   DEFAULT_CALIBRATION.rotate180,
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
