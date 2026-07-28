export type OrderStatus =
    | "new"
    | "contract_drafting"
    | "payment"
    | "financier_signature"
    | "shipment_request"
    | "position_change"
    | "shipping_documents"
    | "shipped"
    | "returned"
    | "cancelled"
    | "shipped_check"

export type SaleItemUnit = "meter" | "pack" | "ton"
export type SaleWeightMode = "theoretical" | "actual"
export type DeliveryMode = "in_total" | "split"

export type SaleProduct = {
    id: number
    name: string
    code: number | null
    articul: string
    price: string
    outer_dimension: string | null
    /** кг/м — вес, тн и цена за тонну считаются из него. */
    theoretical_weight?: string | number | null
    actual_weight?: string | number | null
    /**
     * Вес, по которому строка считается на самом деле: из карточки, а пока
     * она пуста — рассчитанный бэкендом по геометрии трубы. Форма считает
     * по этим полям, поэтому её числа совпадают с сохранёнными.
     */
    theoretical_weight_used?: string | number | null
    actual_weight_used?: string | number | null
    /** Метров в пачке — «Кол-во б. ед.» для пачек. */
    meters_per_pack?: string | number | null
    /** O'lchov birligi («тн», «шт»…). Backend qo'shguncha bo'sh kelishi mumkin. */
    unit?: string | null
}

/**
 * «Доступно» и «Остаток» товара — склад готовой продукции: прокатано минус
 * отгружено, а доступное ещё и минус резерв. В метрах, как «Кол-во б. ед.».
 */
export type ProductStock = {
    product_id: number
    remaining: string
    available: string
}

/** Buyurtma qaysi ombordan bajarilishi. */
export type Warehouse = {
    id: number
    name: string
}

export type SaleClient = {
    id: number
    full_name: string
    company_name: string
    company_phone: string
    /** Address parts — prefill the order's delivery address. */
    region_address?: string | null
    exact_address?: string | null
    legal_address?: string | null
}

export type SaleCurrency = {
    id: number
    currency: string
    current_rate: string
}

export type SaleOwner = {
    id: number
    first_name: string
    last_name: string
}

export type OrderItem = {
    id: number
    product: SaleProduct
    price: string
    quantity: string
    unit: SaleItemUnit
    weight_mode: SaleWeightMode
    price_per_ton: string
    discount: string
    vat: number
    reserve: string
    /** Кол-во, переведённое в метры */
    quantity_base: string
    weight_tn: string
    unit_price: string
    delivery_share: string
    line_total_with_delivery: string
    /** price × quantity with the discount applied */
    line_total: string
    vat_amount: string
    /** quantity already sent out through demands */
    shipped: string
    /** reserve left after shipments */
    active_reserve: string
}

/** Shipment stub shown in the order's "related documents" block. */
export type OrderDemandLink = {
    id: number
    number: string
    doc_date: string
    total_sum: string
}

export type Order = {
    id: number
    number: string
    doc_date: string
    client: SaleClient
    payment_type: string
    currency: SaleCurrency
    client_currency: string | null
    status: OrderStatus
    /** Mijoz bilan shartnoma va lot raqami — «Приложение» sarlavhasiga tushadi. */
    contract_number: string | null
    lot_number: string | null
    warehouse: Warehouse | null
    delivery_planned_date: string | null
    shipment_address: string
    description: string
    owner: SaleOwner | null
    vat_enabled: boolean
    vat_included: boolean
    applicable: boolean
    delivery_cost: string
    delivery_mode: DeliveryMode
    items: OrderItem[]
    total_sum: string
    vat_sum: string
    total_with_vat: string
    weight_sum: string
    grand_total: string
    shipped_sum: string
    reserved_sum: string
    demands: OrderDemandLink[]
    created_at: string
}

export type OrderItemForm = {
    id?: number
    product_id: number | null
    price: number | null
    quantity: number | null
    unit: SaleItemUnit
    weight_mode: SaleWeightMode
    price_per_ton: number | null
    discount: number | null
    vat: number | null
    reserve: number | null
    /** Snapshot of the picked product — the row maths runs on it locally. */
    product?: Pick<
        SaleProduct,
        | "theoretical_weight"
        | "actual_weight"
        | "theoretical_weight_used"
        | "actual_weight_used"
        | "meters_per_pack"
    > | null
}

export type OrderForm = {
    client_id: number | null
    payment_type_id: number | null
    currency_id: number | null
    client_currency: number | null
    contract_number: string
    lot_number: string
    warehouse_id: number | null
    doc_date: string | null
    delivery_planned_date: string | null
    shipment_address: string
    description: string
    status: OrderStatus
    vat_enabled: boolean
    vat_included: boolean
    applicable: boolean
    delivery_cost: number | null
    delivery_mode: DeliveryMode
    items: OrderItemForm[]
}

export type PaymentType = {
    id: number
    name: string
    is_active: boolean
}
