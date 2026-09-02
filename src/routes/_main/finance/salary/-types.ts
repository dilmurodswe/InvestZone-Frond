export type RateUnit = "fixed" | "day" | "hour"

/** A salaried user, as returned by /finance/payroll-employees/. */
export type PayrollEmployee = {
    id: number
    full_name: string
    position: string | null
    department: string | null
}

export type SalaryKind = "advance" | "penalty" | "bonus"

export type SalaryTransaction = {
    id: number
    employee: number
    employee_name: string
    kind: SalaryKind
    amount: string
    payment_type: number | null
    payment_type_name: string | null
    currency: number | null
    currency_name: string | null
    date: string
    comment: string | null
    attachment: string | null
}

export type SalaryIssueForm = {
    employee: number | null
    kind: SalaryKind
    amount: string
    payment_type: number | null
    currency: number | null
    date: string
    comment: string
    attachment: File | string | null
}

export type PayrollRow = {
    id: number
    employee: number
    full_name: string
    department: string | null
    position: string | null
    code: number | null
    base_salary: string
    rate_unit: RateUnit
    month: string
    payout_date: string | null
    norm: string
    worked: string
    advance_total: string
    penalty_total: string
    bonus_total: string
    accrued: string
    comment: string | null
    posted: boolean
}
