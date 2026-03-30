export type OrderItem = {
    id: number
    product: number
    price: number
    count: number
}

export type OrderCurrency = {
    id: number
    currency: string
    current_rate: number
}

export type OrderStatus = "new" | "in_processing" | "completed"

export type Order = {
    id: number
    client: string
    payment_type: string
    currency: OrderCurrency
    client_currency: number | null
    items: OrderItem[]
    status: OrderStatus
    created_at: string
}

export type OrderItemForm = {
    product: number | null
    price: number | null
    count: number | null
}

export type OrderForm = {
    client: number | null
    payment_type: number | null
    currency: number | null
    client_currency: number | null
    status?: "new" | "in_processing" | "completed"
    items: OrderItemForm[]
}

export type ReadyProduct = {
    id: number
    status: string
    stock: number
    product: {
        id: number
        name: string
        code: number
        articul: string
        price: number
    }
    raw_item_detail: {
        id: number
        reference_number: string | null
        price: number | null
        wagon: string | null
        ton: number | null
        weight: number
    }
    created_at: string
}

export type Client = {
    id: number
    full_name: string
}

export type PaymentType = {
    id: number
    name: string
    is_active: boolean
}

export type Currency = {
    id: number
    currency: string
    current_rate: string
    is_active: boolean
}
