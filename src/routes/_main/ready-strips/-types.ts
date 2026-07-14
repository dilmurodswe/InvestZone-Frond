import type { ManufactureStatus } from "../manufactures/-types"

export type StripBatch = {
    id: number
    product_name: string | null
    products_count: number
    strip_count: number
    total_weight: number
    left_over: number | null
    count_raw: number | null
    width: number | null
    thickness: number | null
    status: ManufactureStatus | null
    usage_status: string | null
    created_at: string
}

export type ReadyStrip = {
    id: number
    manufacture_id: number
    manufacture_status: ManufactureStatus | null
    product_name: string
    roll_id: number | null
    roll_plank: string | null
    roll_reference_number: string | null
    rolls: {
        id: number
        plank: string | null
        reference_number: string | null
    }[]
    strip_cut_width_mm: number
    quantity: number
    total_wes: number
    status: string | null
    created_at: string
}
