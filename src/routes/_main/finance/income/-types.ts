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

export type Income = {
    id: number
    name: string
    payment_type: string
    currency: IncomeCurrency
    current_rate: string
    custom_rate: string
    date: string
    sales_agent: string | null
    amount: string
    comment: string
}

export type IncomeForm = {
    name: string
    payment_type: number | null
    currency: number | null
    current_rate: string
    custom_rate: string
    date: string
    sales_agent: number | null
    amount: string
    comment: string
}
