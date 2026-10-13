import { formatNumber } from "@/lib/utils/format-number"

/** Whole sums in UZS; cents in USD / RUB so small converted amounts show. */
export const money = (v: unknown, currency?: string) =>
    formatNumber(v, {
        decimalScale: currency && currency !== "UZS" ? 2 : 0,
        isShowZero: true,
    })

/** Axis / tight-space numbers: 1.2k, 3.4M, 45.6B. */
export const compact = (v: number) => {
    const a = Math.abs(v)
    if (a >= 1e9) return `${+(v / 1e9).toFixed(1)}B`
    if (a >= 1e6) return `${+(v / 1e6).toFixed(1)}M`
    if (a >= 1e3) return `${Math.round(v / 1e3)}k`
    return String(Math.round(v))
}
