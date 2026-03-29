export type ReadyProductStatus =
    | "ready"
    | "request_sent"
    | "waiting_cert"
    | "in_progress"
    | "completed"

export type ReadyProductItem = {
    id: number
    name: string
    code: number
    articul: string
    price: number
}

export type ReadyProductRawDetail = {
    id: number
    reference_number: string | null
    price: number | null
    wagon: number | null
    ton: number | null
    weight: number | null
}

export type ReadyProduct = {
    id: number
    status: ReadyProductStatus
    stock: number
    product: ReadyProductItem
    raw_item_detail: ReadyProductRawDetail
    created_at: string
}
