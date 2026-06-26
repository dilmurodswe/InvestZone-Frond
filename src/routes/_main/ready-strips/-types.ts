export type ReadyStrip = {
    id: number
    manufacture_id: number
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
    created_at: string
}
