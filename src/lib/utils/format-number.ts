import { type NumericFormatProps, numericFormatter } from "react-number-format"

// export function formatNumber(num: unknown = 0) {
//     const n = Number(num)
//     if (typeof n === "number" && !Number.isNaN(n)) {
//         return n.toLocaleString("fr-FR")
//     } else return ""
// }

export function formatNumber(
    val: unknown,
    {
        isShowZero,
        ...props
    }: NumericFormatProps & {
        isShowZero?: boolean
    } = {},
) {
    const num = Number(val)
    const numStr =
        num ? String(num)
        : isShowZero ? "0"
        : ""

    return numericFormatter(numStr, {
        thousandSeparator: " ",
        decimalScale: 3,
        fixedDecimalScale: false,
        ...props,
    })
}

// Helper function for consistent 3-decimal formatting
export function formatDecimal(val: number | null | undefined): string {
    if (val == null) return "—"
    return formatNumber(val, { decimalScale: 3 })
}

/**
 * Trim floating-point noise for display: round to at most 3 decimals and drop
 * trailing zeros, without thousand separators. Integers stay untouched and
 * non-numeric values (dates, references, empty) are returned unchanged.
 *
 * 41.291000000000004 → "41.291"   1250 → "1250"   3.41 → "3.41"
 */
export function round3(val: unknown, dash = "—"): string {
    if (val == null || val === "") return dash
    const n = Number(val)
    if (!Number.isFinite(n)) return String(val)
    return String(Number(n.toFixed(3)))
}
