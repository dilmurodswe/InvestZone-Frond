export type RawMaterial = {
    id: number
    contract_number: string
    supplier: string
    raw_material_name: string
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
