export type ExpenseCurrency = {
    id: number
    currency: string
    current_rate: number
    is_active: boolean
}

export type CategoryRef = {
    id: number
    name: string
} | null

export type Expense = {
    id: number
    payment_type: string
    currency: ExpenseCurrency
    category: CategoryRef
    subcategory: CategoryRef
    attachment: string | null
    current_rate: number
    custom_rate: number
    date: string
    amount: string
    comment: string
}

export type ExpenseForm = {
    payment_type: number | null
    currency: number | null
    category: number | null
    subcategory: number | null
    attachment: File | string | null
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
