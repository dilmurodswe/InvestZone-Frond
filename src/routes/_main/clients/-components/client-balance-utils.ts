import { formatNumber } from "@/lib/utils/format-number"
import { CURRENCY_CODES, type CurrencyCode } from "../-types"

export const fmtMoney = (v: unknown) =>
    formatNumber(v, { decimalScale: 2, isShowZero: true })

/** `+` = client is in credit (аванс), `-` = client owes us (долг). */
export const balanceToneClass = (v: unknown) =>
    Number(v) < 0 ? "text-red-500" : "text-green-500"

/** Best-effort "USD (12500.00)" / "доллар USD" -> "USD". Falls back to UZS. */
export const toCurrencyCode = (raw: unknown): CurrencyCode => {
    const s = String(raw ?? "").toUpperCase()
    return CURRENCY_CODES.find((c) => s.includes(c)) ?? "UZS"
}
