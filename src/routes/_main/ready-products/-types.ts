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

export type ReadyProduct = {
    id: number
    status: ReadyProductStatus
    stock: number
    product: ReadyProductItem
    created_at: string
}
