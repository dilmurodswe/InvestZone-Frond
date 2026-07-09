/**
 * Prokatka yorlig'idagi shtrix-kod uchun ma'lumot.
 *
 * Maket chiziqli (Code 128) shtrix-kodni talab qiladi. Chiziqli kodga
 * yorliqdagi BARCHA matn sig'maydi — 50mm kenglikda taxminan 15-20 ta ASCII
 * belgi. Shu sabab kodga qisqa kalit yoziladi: plan № + pachka № + vazn.
 * Skaner shu kalit bo'yicha bazadan to'liq ma'lumotni topadi.
 */

import { toCode128Ascii } from "./code128"
import type { RollingLabelData, RollingPackData } from "./types"

/** Faqat raqamlarni qoldiradi ("Пачка 1" → "1"). */
function digitsOf(value: string): string {
    const digits = value.replace(/\D+/g, "")
    return digits || toCode128Ascii(value).replace(/\s+/g, "")
}

/**
 * Shtrix-kod ichidagi kalit: `PLAN-PACK-WEIGHT`.
 * Masalan: `M2-1-1.2` (plan M2, 1-pachka, 1.2 tonna).
 */
export function buildBarcodePayload(
    data: RollingLabelData,
    pack: RollingPackData,
): string {
    const plan = toCode128Ascii(data.planNumber).replace(/\s+/g, "")
    const packNo = digitsOf(pack.packNumber)
    const weight = String(pack.weightTn ?? "")
    return `${plan}-${packNo}-${weight}`.toUpperCase()
}

/** mm → metr, 1 xona aniqligida (masalan 10000mm → "10"). */
export function metersFromMm(lengthMm: number): string {
    const m = lengthMm / 1000
    return Number.isInteger(m) ? String(m) : m.toFixed(1)
}
