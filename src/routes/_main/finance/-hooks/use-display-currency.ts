import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { useSearch } from "@tanstack/react-router"

/** Search-param key of the "show amounts in" select — never sent to the API. */
export const DISPLAY_CURRENCY_KEY = "display_currency"

export const DISPLAY_CURRENCY_OPTIONS = [
    { id: "uzs", name: "UZS" },
    { id: "usd", name: "USD" },
]

type DisplayCode = "UZS" | "USD"

type ConvertibleRow = {
    amount: string | number
    currency?: { currency?: string } | null
    current_rate?: string | number | null
    custom_rate?: string | number | null
}

export type ConvertedAmount = {
    amount: number
    code: string
    /** Set when `amount` was converted — the row's own amount and currency. */
    original: { amount: number; code: string } | null
}

const rowCode = (row: ConvertibleRow) => {
    const value = String(row.currency?.currency ?? "UZS").toUpperCase()
    if (value.includes("USD")) return "USD"
    if (value.includes("RUB")) return "RUB"
    return "UZS"
}

/**
 * The document's USD↔UZS rate (Свой курс, else Текущий курс). Both UZS and USD
 * documents carry it as "UZS per 1 USD"; 1 or empty means none was set.
 */
const docRate = (row: ConvertibleRow) => {
    const rate = Number(row.custom_rate) || Number(row.current_rate) || 0
    return rate > 1 ? rate : 0
}

/** Strip the display-only key before the params go to the backend. */
export const withoutDisplayCurrency = (params: Record<string, unknown>) => {
    const { [DISPLAY_CURRENCY_KEY]: _omit, ...rest } = params
    return rest
}

/**
 * Converts every row's amount into the currency picked in the select instead of
 * filtering rows by currency. Each row uses its own USD↔UZS document rate; rows
 * without one fall back to the market USD rate. RUB rows are left as they are.
 */
export function useDisplayCurrency() {
    const search = useSearch({ strict: false }) as Record<string, unknown>
    const picked = String(search[DISPLAY_CURRENCY_KEY] ?? "").toUpperCase()
    const target: DisplayCode | null =
        picked === "USD" || picked === "UZS" ? picked : null

    const { data } = useGet<{ rate: number }>(API.FINANCE.USD_RATE.INDEX, {
        options: { enabled: !!target, staleTime: 1000 * 60 * 30 },
    })
    const marketUsd = Number(data?.rate) || 0

    const convert = (row: ConvertibleRow): ConvertedAmount => {
        const amount = Number(row.amount) || 0
        const code = rowCode(row)
        const rate = docRate(row) || marketUsd
        if (!target || code === target || code === "RUB" || !rate) {
            return { amount, code, original: null }
        }
        return {
            amount: target === "USD" ? amount / rate : amount * rate,
            code: target,
            original: { amount, code },
        }
    }

    return { target, convert }
}
