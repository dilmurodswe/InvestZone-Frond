import type { OrderForm, OrderItemForm } from "../-types"

/**
 * Line maths of the sales spreadsheet, mirrored from the backend
 * (`SaleDocumentItem`) so the form can show the numbers while typing.
 *
 * Everything is computed on the base unit — the running metre:
 *   кол-во б. ед. = кол-во → м (пачки × метров в пачке, тонны через вес)
 *   вес, тн       = вес (кг/м) × кол-во б. ед. / 1000
 *   цена          = ROUND(вес (кг/м) × цена за тонну / 1000, 3)
 *   сумма         = цена × кол-во б. ед. × (1 − скидка %)
 */
const num = (value: unknown) => Number(value ?? 0) || 0

/**
 * Which weight of the product the line runs on. A quantity entered in tons is
 * converted through the actual weight, metres and packs through the
 * theoretical one — exactly as in the spreadsheet.
 */
export function weightMode(item: OrderItemForm) {
    return item.unit === "ton" ? "actual" : "theoretical"
}

/** кг/м of the picked product, theoretical or actual. */
export function weightPerMeter(item: OrderItemForm) {
    if (!item.product) return 0
    return weightMode(item) === "actual" ?
            num(item.product.actual_weight)
        :   num(item.product.theoretical_weight)
}

/** «Кол-во б. ед.» — the entered quantity converted to metres. */
export function quantityBase(item: OrderItemForm) {
    const quantity = num(item.quantity)
    if (item.unit === "pack") {
        return quantity * num(item.product?.meters_per_pack)
    }
    if (item.unit === "ton") {
        const perMeter = weightPerMeter(item)
        return perMeter > 0 ? (quantity * 1000) / perMeter : 0
    }
    return quantity
}

/** «Вес, тн» of the line — what the money is actually counted on. */
export function weightTn(item: OrderItemForm) {
    if (item.unit === "ton") return num(item.quantity)
    return (weightPerMeter(item) * quantityBase(item)) / 1000
}

/**
 * «Цена» per base unit, always derived: a quantity in tons is priced by the
 * price per ton as is, everything else through the weight —
 * ROUND(вес × цена за тонну / 1000, 3).
 */
export function unitPrice(item: OrderItemForm) {
    const perTon = num(item.price_per_ton)
    if (perTon <= 0) return num(item.price)
    if (item.unit === "ton") return perTon
    return Math.round(((weightPerMeter(item) * perTon) / 1000) * 1000) / 1000
}

/**
 * «Сумма» of the line — цена × кол-во, exactly as in the sheet: the rounded
 * price per running metre times the base quantity, or the price per ton times
 * the tons when the line is entered in tons. The discount is ours, applied on
 * top.
 */
export function lineTotal(item: OrderItemForm) {
    const perTon = num(item.price_per_ton)
    const gross =
        perTon <= 0 ? num(item.price) * quantityBase(item)
        : item.unit === "ton" ? perTon * num(item.quantity)
        : unitPrice(item) * quantityBase(item)
    return gross * (1 - num(item.discount) / 100)
}

export type OrderTotals = {
    /** Промежуточный итог */
    subtotal: number
    /** В том числе НДС */
    vat: number
    /** Вес отгрузки, тн */
    weight: number
    /** Доставка */
    delivery: number
    /** Итого */
    grandTotal: number
}

/** Document totals block of the spreadsheet. */
export function orderTotals(values: OrderForm): OrderTotals {
    const items = values.items ?? []
    const subtotal = items.reduce((acc, item) => acc + lineTotal(item), 0)
    const weight = items.reduce((acc, item) => acc + weightTn(item), 0)

    const vat =
        values.vat_enabled ?
            items.reduce((acc, item) => {
                const rate = num(item.vat)
                if (rate <= 0) return acc
                const total = lineTotal(item)
                return (
                    acc +
                    (values.vat_included ?
                        (total * rate) / (100 + rate)
                    :   (total * rate) / 100)
                )
            }, 0)
        :   0

    const delivery = num(values.delivery_cost)
    const withVat =
        values.vat_enabled && !values.vat_included ? subtotal + vat : subtotal

    return {
        subtotal,
        vat,
        weight,
        delivery,
        grandTotal: withVat + delivery,
    }
}
