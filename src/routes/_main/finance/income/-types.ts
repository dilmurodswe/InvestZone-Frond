export type IncomeCurrency = {
    id: number
    currency: string
    current_rate: number
    is_active: boolean
}

export type PaymentType = {
    id: number
    name: string
    is_active: boolean
}

export type SalesAgent = {
    id: number
    phone_number: string
    first_name: string
    last_name: string
    email: string | null
    employee_code: number | null
    role: string
    is_active: boolean
    date_joined: string
}

export type CategoryRef = {
    id: number
    name: string
} | null

/** Set when the row was auto-created from a salary transaction. */
export type FinanceOrigin = "advance" | "bonus" | "penalty" | null

export type Income = {
    id: number
    payment_type: string
    currency: IncomeCurrency
    category: CategoryRef
    subcategory: CategoryRef
    attachment: string | null
    current_rate: string
    custom_rate: string
    date: string
    sales_agent: string | null
    amount: string
    comment: string
    origin: FinanceOrigin
}

export type IncomeForm = {
    payment_type: number | null
    currency: number | null
    category: number | null
    subcategory: number | null
    attachment: File | string | null
    current_rate: string
    custom_rate: string
    date: string
    sales_agent: number | null
    amount: string
    comment: string
}
