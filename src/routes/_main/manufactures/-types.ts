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
    raw_item_details: string
    stock: number
    status: ManufactureStatus
    created_at: string
}

export type RawItemDetail = {
    id: number
    contract_number: string | null
    supplier: string | null
    raw_material_name: string | null
    ton: number | null
    weight: number | null
    netto: number | null
    inner_size: number | null
    outer_size: number | null
    standard: string | null
    mark: string | null
    plank: string | null
    reference_number: string | null
    price: number | null
    wagon: number | null
    created_at: string
    updated_at: string
}
