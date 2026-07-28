import type {
    DeliveryMode,
    SaleClient,
    SaleCurrency,
    SaleItemUnit,
    SaleOwner,
    SaleProduct,
    SaleWeightMode,
} from "../orders/-types"

export type DemandItem = {
    id: number
    product: SaleProduct
    /** Order line this shipment covers, null for a standalone shipment. */
    order_item: number | null
    price: string
    quantity: string
    unit: SaleItemUnit
    weight_mode: SaleWeightMode
    price_per_ton: string
    discount: string
    vat: number
    /** Кол-во, переведённое в метры */
    quantity_base: string
    weight_tn: string
    unit_price: string
    delivery_share: string
    line_total_with_delivery: string
    line_total: string
    vat_amount: string
}

export type Demand = {
    id: number
    number: string
    doc_date: string
    order: number | null
    order_number: string | null
    client: SaleClient
    currency: SaleCurrency
    client_currency: string | null
    shipment_address: string
    description: string
    owner: SaleOwner | null
    vat_enabled: boolean
    vat_included: boolean
    applicable: boolean
    carrier: string
    cargo_name: string
    places_count: number | null
    transport_number: string
    waybill_number: string
    waybill_date: string | null
    delivery_cost: string
    delivery_mode: DeliveryMode
    items: DemandItem[]
    total_sum: string
    vat_sum: string
    total_with_vat: string
    weight_sum: string
    grand_total: string
    created_at: string
}

/** Header fields a shipment document allows editing after it was created. */
export type DemandHeaderForm = {
    doc_date: string | null
    description: string
    shipment_address: string
    carrier: string
    cargo_name: string
    places_count: number | null
    transport_number: string
    waybill_number: string
    waybill_date: string | null
    applicable: boolean
}
