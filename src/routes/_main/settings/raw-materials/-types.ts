export type RawMaterial = {
    id: number
    name: string
    standard: string
    mark: string
    description?: string
    extra_fields?: Record<string, string>
}
