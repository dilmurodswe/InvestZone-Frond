export type RequestStatus = 1 | 2 | 3 | 4 | 5 | 6
export type RowItem = {
    id?: number
    raw_material: number
    raw_material_name?: string
    ton: number
}

export type RowRequestFile = {
    id?: number
    file?: string
}

export type RawMaterialRequest = {
    id: number
    contract_number?: string
    quantity?: number
    supplier?: string
    created_at?: string
    status: RequestStatus
    tolerant?: number
    accepted_ton?: number
    differance?: number
    row_items: RowItem[]
    row_request_files: RowRequestFile[]
}

export type RequestDetailRow = {
    id?: number
    raw_material_name: string
    contract_number: string
    weight?: string
    netto?: string
    standard?: string
    mark?: string
    plavka?: string
    party_number?: string
    rulon?: string
    vagon?: string
}
