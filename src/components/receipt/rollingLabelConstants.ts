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

/** Chiziqli shtrix-kod (Code 128) o'lchami — birka pastida, chap tomonda. */
export const BARCODE_WIDTH_MM = 50
export const BARCODE_HEIGHT_MM = 9

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
 *  - pitchMm: qo'shni ikki birkaning perforatsiyalari orasidagi masofa.
 *      Maket bo'yicha 130mm. Barcha birkalar BITTA uzun sahifaga shu qadam
 *      bilan joylashtiriladi, shuning uchun oraliqni printer emas, biz
 *      belgilaymiz va xato birkadan birkaga to'planmaydi. Agar keyingi birka
 *      pastga surilsa — qadamni kamaytiring, yuqoriga sursa — oshiring.
 *  - endTrimMm: chop etish tugagach printer ortiqcha suradigan qog'oz (mm).
 *      Sahifani shuncha qisqartiramiz, shunda qog'oz aynan perforatsiyada
 *      to'xtaydi. Birka 180° aylantirilgani uchun sahifaning oxiri birkaning
 *      BO'SH shapka zonasiga to'g'ri keladi — ma'lumot kesilmaydi.
 */
export type LabelCalibration = {
    offsetXMm: number
    offsetYMm: number
    rotate180: boolean
    pitchMm: number
    endTrimMm: number
}

/**
 * Bu printer sahifa tugagan joyda to'xtaydi va o'sha yerdan keyingi ishni
 * boshlaydi — qog'ozni orqaga qaytarmaydi. Shu sabab ikki nosozlik bitta
 * sababdan kelib chiqadi:
 *
 *   sahifa 130mm, lekin ish ~24mm kech boshlanadi
 *     → qog'oz perforatsiyadan ~24mm o'tib to'xtaydi ("ortiqcha chiqadi")
 *     → keyingi ish yana o'sha 24mm kech boshlanadi ("ma'lumot pastga tushadi")
 *
 * Yechim: sahifani 24mm ga qisqartiramiz (130 − 24 = 106mm). Endi sahifa aynan
 * perforatsiyada tugaydi, keyingi ish esa perforatsiyadan boshlanadi — shuning
 * uchun offsetY ham 0 bo'ladi. Qisqartirilgan qism birkaning bo'sh shapka
 * zonasiga to'g'ri keladi (birka 180° aylantirilgan), ma'lumot kesilmaydi.
 */
export const DEFAULT_CALIBRATION: LabelCalibration = {
    offsetXMm: 0,
    offsetYMm: 0,
    rotate180: true,
    pitchMm: LABEL_HEIGHT_MM,
    endTrimMm: 24,
}

/** Birka qadami chegarasi (mm) — tanadan kichik bo'lolmaydi. */
export const PITCH_RANGE_MM = { min: LABEL_HEIGHT_MM, max: 170 }

/**
 * Sahifani ko'pi bilan qancha qisqartirsa bo'ladi.
 *
 * Qisqartirish birkaning bo'sh shapka zonasini (0…32mm) yeydi, lekin manfiy
 * offsetY o'sha zonaning bir qismini allaqachon ishlatgan bo'ladi. Shuning
 * uchun chegara offsetY ga bog'liq — aks holda birinchi qator kesiladi.
 */
export function maxEndTrimMm(offsetYMm: number): number {
    return Math.max(0, HEADER_RESERVED_MM + offsetYMm - 2)
}

export const endTrimRangeMm = (offsetYMm: number) => ({
    min: 0,
    max: maxEndTrimMm(offsetYMm),
})

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
    pitchMm: LABEL_HEIGHT_MM,
    endTrimMm: 0,
}

// v8 — offsetY=0, sahifa oxiri 24mm qisqartiriladi
const STORAGE_KEY = "iz.rollingLabel.calibration.v8"

/** Saqlangan kalibrovkani o'qiydi (bo'lmasa — standart qiymatlar). */
export function loadCalibration(): LabelCalibration {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return DEFAULT_CALIBRATION
        const parsed = JSON.parse(raw) as Partial<LabelCalibration>
        const offsetY =
            typeof parsed.offsetYMm === "number" ?
                clampTo(parsed.offsetYMm, OFFSET_Y_RANGE_MM)
            :   DEFAULT_CALIBRATION.offsetYMm
        return {
            offsetXMm:
                typeof parsed.offsetXMm === "number" ?
                    clampTo(parsed.offsetXMm, OFFSET_X_RANGE_MM)
                :   DEFAULT_CALIBRATION.offsetXMm,
            offsetYMm: offsetY,
            rotate180:
                typeof parsed.rotate180 === "boolean" ?
                    parsed.rotate180
                :   DEFAULT_CALIBRATION.rotate180,
            pitchMm:
                typeof parsed.pitchMm === "number" ?
                    clampTo(parsed.pitchMm, PITCH_RANGE_MM)
                :   DEFAULT_CALIBRATION.pitchMm,
            endTrimMm:
                typeof parsed.endTrimMm === "number" ?
                    clampTo(parsed.endTrimMm, endTrimRangeMm(offsetY))
                :   DEFAULT_CALIBRATION.endTrimMm,
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
