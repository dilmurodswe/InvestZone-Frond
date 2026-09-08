export type CashCurrency = "UZS" | "USD" | "RUB"

export type CashFlowRow = {
    id: number
    type: "income" | "expense"
    doc_no: string
    date: string
    payment_type: number | null
    payment_type_name: string
    currency: CashCurrency
    amount: string
    signed_amount: string
    purpose: string
    balance_after: string
}

export type CashFlowResponse = {
    opening: Partial<Record<CashCurrency, string>>
    closing: Partial<Record<CashCurrency, string>>
    rows: CashFlowRow[]
}
