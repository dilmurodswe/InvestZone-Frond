export type ManufactureStatus =
    | "ready"
    | "request_sent"
    | "waiting_cert"
    | "in_progress"
    | "completed"

export type RawItemDetail = {
    id: number
    status: string
    brutto: number | null
    netto: number | null
    inner_size: number | null
    outer_size: number | null
    plank: string | null
    reference_number: string | null
    wagon: number | null
    created_at: string
    updated_at: string
    raw_material?: {
        id: number
        name: string
        thickness: number
        width: number
        standard: string | null
        mark: string | null
        sku: string | null
    }
}
export type DetailItem = {
    id: number
    product: {
        id: number
        name: string
        outer_dimension: string
        code: number | null
        articul: string | null
        price: number | null
    }
    strip_width_theoretical: number
    strip_cut_width_mm: number
    quantity_in_cut: number
    total_amount: number
    weight_from_cut: number
}
export type Manufacture = {
    id: number
    width: number
    thickness: number
    status: ManufactureStatus
    count_raw: number
    total_netto: number
    total_sum: number
    total_cut_weight: number
    raw_item_details: RawItemDetail[]
    detail_items: DetailItem[]
    created_at: string
    updated_at: string
    left_over: number
    is_plan_fact: boolean
}

export type ManufactureDetail = Manufacture
