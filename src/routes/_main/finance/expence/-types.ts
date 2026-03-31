export type ExpenseCurrency = {
    id: number
    currency: string
    current_rate: number
    is_active: boolean
}

export type Expense = {
    id: number
    name: string
    payment_type: string
    currency: ExpenseCurrency
    current_rate: number
    custom_rate: number
    date: string
    amount: string
    comment: string
}

export type ExpenseForm = {
    name: string
    payment_type: number | null
    currency: number | null
    current_rate: number | string
    custom_rate: number | string
    date: string
    amount: string
    comment: string
}
export type PaymentType = {
    id: number
    name: string
    is_active: boolean
}
