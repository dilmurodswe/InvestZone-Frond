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
        ...props,
    })
}
