import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { useCallback } from "react"

type Code = "UZS" | "USD" | "RUB"
type RefCurrency = {
    currency: string
    currency_type?: string | null
    current_rate: number | string
}

const codeOf = (c: RefCurrency): Code => {
    const v = String(c.currency_type || c.currency || "UZS").toUpperCase()
    return v === "USD" || v === "RUB" ? v : "UZS"
}

/**
 * Units of each currency per 1 USD, read from the currency reference whichever
 * currency is its base (rate == 1) — mirrors the backend `reference_rates()`.
 */
const perUsdOf = (list: RefCurrency[]) => {
    const ref: Partial<Record<Code, number>> = {}
    for (const c of list) {
        const code = codeOf(c)
        if (ref[code] == null) ref[code] = Number(c.current_rate) || 0
    }
    const per: Partial<Record<Code, number>> = { USD: 1 }
    const { USD: usd, UZS: uzs, RUB: rub } = ref
    if (usd === 1) {
        if (uzs && uzs > 1) per.UZS = uzs
        if (rub && rub > 0) per.RUB = rub
    } else if (uzs === 1 && usd && usd > 1) {
        per.UZS = usd
        if (rub && rub > 0) per.RUB = usd / rub
    }
    return per
}

/** Convert balances held in several currencies with the reference rates. */
export function useReferenceRates() {
    const { data } = useGet<{ results: RefCurrency[] }>(
        API.SETTINGS.CURRENCY.INDEX,
        { params: { page_size: 100 } },
    )
    const list = data?.results

    /** `amount` in `from` → `to`; 0 when a rate is missing. */
    const convert = useCallback(
        (amount: number, from: string, to: string) => {
            if (!amount) return 0
            if (from === to) return amount
            const perUsd = perUsdOf(list ?? [])
            const a = perUsd[from as Code]
            const b = perUsd[to as Code]
            return a && b ? (amount / a) * b : 0
        },
        [list],
    )

    return { convert }
}
