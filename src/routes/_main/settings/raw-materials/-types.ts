export type RawMaterial = {
    id: number
    name: string
    standard: string
    mark: string
    sku: string
    width?: number | null
    thickness?: number | null
    description?: string
    extra_fields?: Record<string, string>
}
