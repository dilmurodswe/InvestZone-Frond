export type OrderStatus =
    | "new"
    | "in_processing"
    | "reserved"
    | "shipped"
    | "completed"
    | "cancelled"

export type SaleProduct = {
    id: number
    name: string
    code: number | null
    articul: string
    price: string
    outer_dimension: string | null
    /** O'lchov birligi («тн», «шт»…). Backend qo'shguncha bo'sh kelishi mumkin. */
    unit?: string | null
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
    discount: string
    vat: number
    reserve: string
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
    items: OrderItem[]
    total_sum: string
    vat_sum: string
    total_with_vat: string
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
    discount: number | null
    vat: number | null
    reserve: number | null
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
    items: OrderItemForm[]
}

export type PaymentType = {
    id: number
    name: string
    is_active: boolean
}
