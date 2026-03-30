export type Order = {
    id: number
    client: number
    payment_type: number
    currency: number
    client_currency: number | null
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
