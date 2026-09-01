export const CURRENCY_TYPES = ["USD", "UZS", "RUB", "EUR"] as const

export type CurrencyType = (typeof CURRENCY_TYPES)[number]

export const currencyTypeOptions: { id: CurrencyType; name: CurrencyType }[] =
    CURRENCY_TYPES.map((t) => ({ id: t, name: t }))

export type Currency = {
    id: number
    currency: string
    currency_type: CurrencyType
    current_rate: string
    is_active: boolean
}
