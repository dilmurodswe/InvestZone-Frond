export type RawMaterial = {
    id: number
    contract_number: string
    supplier: string
    raw_material: {
        id: number
        name: string
        standard: string | null
        mark: string | null
        sku: string | null
        width: number | null
        thickness: number | null
    } | null
    price: number | null
    status: string | null
    netto: number | null
    inner_size: number | null
    outer_size: number | null
    plank: string | null
    reference_number: string | null
    wagon: string | null
    created_at: string
    updated_at: string
}
