export type ManufactureStatus =
    | "ready"
    | "request_sent"
    | "waiting_cert"
    | "in_progress"
    | "completed"

export type Manufacture = {
    id: number
    category: string
    sub_category: string
    product: string
    raw_item_detail: number
    stock: number
    status: ManufactureStatus
    created_at: string
}
