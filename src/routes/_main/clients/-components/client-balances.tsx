import { cn } from "@/lib/utils/shadcn"
import {
    CURRENCY_CODES,
    type ClientBalances,
    type CurrencyCode,
} from "../-types"
import { balanceToneClass, fmtMoney } from "./client-balance-utils"

/** Stacked USD / UZS / RUB balances; zero currencies are hidden. */
export function ClientBalancesCell({
    balances,
    className,
}: {
    balances: ClientBalances | null | undefined
    className?: string
}) {
    const shown = CURRENCY_CODES.filter((c) => Number(balances?.[c]))
    return (
        <div
            className={cn(
                "flex flex-col gap-0.5 text-xs tabular-nums",
                className,
            )}
        >
            {shown.length === 0 ?
                <span className="text-muted-foreground">—</span>
            :   shown.map((code) => (
                    <span
                        key={code}
                        className={cn(
                            "font-semibold",
                            balanceToneClass(balances?.[code]),
                        )}
                    >
                        {fmtMoney(balances?.[code])} {code}
                    </span>
                ))
            }
        </div>
    )
}

/** Single-currency balance for one main-table column. `—` when zero. */
export function ClientBalanceCurrencyCell({
    balances,
    currency,
}: {
    balances: ClientBalances | null | undefined
    currency: CurrencyCode
}) {
    const raw = balances?.[currency]
    if (!Number(raw)) {
        return <span className="text-xs text-muted-foreground">—</span>
    }
    return (
        <span
            className={cn(
                "text-xs font-semibold tabular-nums",
                balanceToneClass(raw),
            )}
        >
            {fmtMoney(raw)} {currency}
        </span>
    )
}

/** One-currency inline chip for the sales-document forms.
 * Shows «Аванс: X» when the client is in credit, «Долг: X» when they owe us. */
export function ClientBalanceChip({
    balances,
    currency,
    labels,
}: {
    balances: ClientBalances | null | undefined
    currency: CurrencyCode
    labels: { advance: string; debt: string; zero: string }
}) {
    const raw = balances?.[currency] ?? "0"
    const n = Number(raw)
    if (!n) {
        return (
            <span className="text-xs text-muted-foreground">
                {labels.zero}: 0 {currency}
            </span>
        )
    }
    return (
        <span className={cn("text-xs font-semibold", balanceToneClass(raw))}>
            {n < 0 ? labels.debt : labels.advance}: {fmtMoney(Math.abs(n))}{" "}
            {currency}
        </span>
    )
}
