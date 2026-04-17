export type CustomerType =
    | "llc"
    | "jv_llc"
    | "family"
    | "jsc"
    | "fie"
    | "ue"
    | "be"
    | "sp"

export interface Client {
    id: number
    company_name: string
    customer_type: CustomerType | null
    activity_field: string
    company_phone: string
    company_email: string
    region_address: string
    exact_address: string
    legal_address: string
    inn: string
    official_name: string
    bank_name: string
    bank_address: string
    mfo_code: string
    account_number: string
    okpo_code: string
    position: string
    full_name: string
    phone: string
    email: string
    notes: string
    balance: number | null
    created_at: string
}
