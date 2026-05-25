import { formatNumber } from "@/lib/utils/format-number"
import { cn } from "@/lib/utils/shadcn"
import type { ReactNode } from "react"
import type { NumericFormatProps } from "react-number-format"

export function NumberSpan({
    className,
    val,
    children,
    isAbsolute,
    ...props
}: NumericFormatProps & {
    isShowZero?: boolean
    children?: ReactNode
    val: unknown
    isAbsolute?: boolean
}) {
    const value = formatNumber(
        isAbsolute ? Math.abs(Number(val) || 0) : val,
        {
            decimalScale: 3,
            ...props,
        },
    )
    const num = Number(val)

    const defaultPriceClassName = cn(
        num > 0 && "text-green-500",
        num < 0 && "text-red-500",
    )

    return (
        <span className={cn(defaultPriceClassName, className)}>
            {value}
            {children}
        </span>
    )
}
