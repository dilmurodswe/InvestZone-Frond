export type Category = {
    id: number
    name: string
    type: "truba" | "profil" | "list"
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
    /** Вес, кг/м — прайс по весу считается из него. */
    theoretical_weight: number
    actual_weight: number
    /** Метров в пачке — для «Кол-во б. ед.». */
    meters_per_pack: number
    description?: string
    extra_fields?: Record<string, string>
    outer_dimension?: string
    thickness?: number
}
