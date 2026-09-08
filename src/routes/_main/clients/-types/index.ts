export type CustomerType =
    | "llc"
    | "jv_llc"
    | "family"
    | "jsc"
    | "fie"
    | "ue"
    | "be"
    | "sp"

export type CurrencyCode = "USD" | "UZS" | "RUB"

export const CURRENCY_CODES: CurrencyCode[] = ["USD", "UZS", "RUB"]

/** Взаиморасчёты balance per currency. `+` = client in credit (аванс),
 * `-` = client owes us (долг). */
export type ClientBalances = Record<CurrencyCode, string>

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
    /** Legacy single balance — superseded by `balances` / opening fields. */
    balance: number | string | null
    opening_balance_usd: number | string | null
    opening_balance_uzs: number | string | null
    opening_balance_rub: number | string | null
    opening_balance_date: string | null
    balances: ClientBalances | null
    created_at: string
}

export type ClientLedgerKind = "shipment" | "payment" | "adjustment"

export type ClientLedgerRow = {
    id: number
    date: string
    kind: ClientLedgerKind
    currency: CurrencyCode
    comment: string
    signed_amount: string
    income: string
    expense: string
    balance_after: string
}

export type ClientLedgerResponse = {
    opening: Partial<ClientBalances>
    closing: Partial<ClientBalances>
    rows: ClientLedgerRow[]
}

export type MutualSettlementRow = {
    client_id: number
    client_name: string
    opening: Partial<ClientBalances>
    income: Partial<ClientBalances>
    expense: Partial<ClientBalances>
    closing: Partial<ClientBalances>
}

export type MutualSettlementsResponse = {
    start_date: string | null
    end_date: string | null
    results: MutualSettlementRow[]
}
