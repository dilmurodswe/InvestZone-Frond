import { formatNumber } from "@/lib/utils/format-number"
import { cn } from "@/lib/utils/shadcn"
import type { ConvertedAmount as Converted } from "../-hooks/use-display-currency"

type Props = {
    value: Converted
    className?: string
}

/** Amount in the display currency, with the row's own amount underneath. */
export default function ConvertedAmount({ value, className }: Props) {
    return (
        <div className="flex flex-col">
            <span
                className={cn(
                    "text-sm font-semibold tabular-nums whitespace-nowrap",
                    className,
                )}
            >
                {formatNumber(value.amount, {
                    decimalScale: 2,
                    isShowZero: true,
                })}{" "}
                {value.code}
            </span>
            {value.original && (
                <span className="text-xs tabular-nums text-muted-foreground whitespace-nowrap">
                    {formatNumber(value.original.amount, {
                        decimalScale: 2,
                        isShowZero: true,
                    })}{" "}
                    {value.original.code}
                </span>
            )}
        </div>
    )
}
