export type Category = {
    id: number
    name: string
    type: "truba" | "profil"
}

export type SubCategory = {
    id: number
    name: string
    parent: number
}

export type Product = {
    id: number
    name: string
    category: number
    sub_category: number
    code: number
    articul: string
    price: number
    theoretically_price: number
    factually_price: number
    description?: string
    extra_fields?: Record<string, string>
    outer_dimension?: string
    diameter?: number
}
