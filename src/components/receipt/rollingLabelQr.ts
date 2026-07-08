/**
 * Prokatka yorlig'i uchun QR kod payload'i va rasm generatori.
 * QR ichida yorliqdagi BARCHA ma'lumot + pachka vazni saqlanadi.
 */

import QRCode from "qrcode"
import { LABEL_CERTIFICATIONS } from "./rollingLabelConstants"
import type { RollingLabelData, RollingPackData } from "./types"

/** Bitta pachka uchun QR ichiga yoziladigan to'liq ma'lumot (JSON). */
export function buildQrPayload(
    data: RollingLabelData,
    pack: RollingPackData,
): string {
    const payload = {
        date: data.productionDate, // ДАТА
        tubeSize: data.tubeSize, // РАЗМЕР ТРУБЫ
        specification: data.specification || "", // SPECIFICATION
        standard: data.standard, // СТАНДАРТ НТД
        steelGrade: data.steelGrade, // МАРКА СТАЛИ
        plan: data.planNumber, // ПАРТИЯ № (№ Плана)
        pack: pack.packNumber, // ПАЧКА №
        length: metersFromMm(data.length), // ДЛИНА, М
        totalLength: data.totalLength ?? null, // ОБЩАЯ ДЛИНА, М
        weight: pack.weightTn, // Вес пачки (тн)
        quantity: pack.quantity, // Soni
        cert: LABEL_CERTIFICATIONS, // Sertifikatlar
    }

    return JSON.stringify(payload)
}

/** QR payload'ni PNG data-URL ko'rinishida qaytaradi (yorliqqa joylash uchun). */
export async function makeQrDataUrl(payload: string): Promise<string> {
    return QRCode.toDataURL(payload, {
        errorCorrectionLevel: "M",
        margin: 0,
        scale: 8,
        color: { dark: "#000000", light: "#FFFFFF" },
    })
}

/** mm → metr, 1 xona aniqligida (masalan 10000mm → "10"). */
export function metersFromMm(lengthMm: number): string {
    const m = lengthMm / 1000
    return Number.isInteger(m) ? String(m) : m.toFixed(1)
}
