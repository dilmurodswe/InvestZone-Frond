export type ManufactureStatus =
    | "ready"
    | "request_sent"
    | "waiting_cert"
    | "in_progress"
    | "completed"

export type RawItemDetail = {
    id: number
    // ✅ qo'shildi
    contract_number: string | null
    supplier: string | null
    raw_material_name: string | null
    // mavjudlar
    ton: number | null
    weight: number | null
    status: string
    netto: number | null
    inner_size: number | null
    outer_size: number | null
    standard: string | null
    mark: string | null
    plank: string | null
    reference_number: string | null
    price: number | null
    wagon: string | null
    created_at: string
    updated_at: string
}

export type ManufactureDetail = {
    id: number
    category_id: number
    category: string
    sub_category_id: number
    sub_category: string
    product_id: number
    product: string
    raw_item_details: RawItemDetail[]
    stock: number
    status: ManufactureStatus
    created_at: string
}

// List uchun (jadvalda)
export type Manufacture = {
    id: number
    category: string
    sub_category: string
    product: string
    stock: number
    status: ManufactureStatus
    created_at: string
}
