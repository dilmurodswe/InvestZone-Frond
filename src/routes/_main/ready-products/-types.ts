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
}

export type DetailItem = {
    id: number
    product: ReadyProductItem
    strip_width_theoretical: number
    strip_cut_width_mm: number
    quantity_in_cut: number
    total_amount: number
    weight_from_cut: number
}

export type ReadyProduct = {
    id: number
    status: ReadyProductStatus
    width: number
    thickness: number
    raw_item_details: RawItemDetail[]
    detail_items: DetailItem[]
    created_at: string
    updated_at: string
}
