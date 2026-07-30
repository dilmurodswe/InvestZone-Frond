import type { OrderForm, OrderItemForm, SaleItemUnit } from "../-types"

/**
 * «Ед. изм.» строки — метр, пачка или тонна. Берётся с самой позиции, а не из
 * карточки товара: один и тот же товар продаётся и в метрах, и в тоннах.
 */
export const unitKey = (unit: SaleItemUnit | null | undefined) =>
    unit === "pack" ? ("common.pack" as const)
    : unit === "ton" ? ("common.ton" as const)
    : ("common.meter" as const)

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
const round3 = (value: number) => Math.round(value * 1000) / 1000

/**
 * Which weight of the product the line runs on. A quantity entered in tons is
 * converted through the actual weight, metres and packs through the
 * theoretical one — exactly as in the spreadsheet.
 */
export function weightMode(item: OrderItemForm) {
    return item.unit === "ton" ? "actual" : "theoretical"
}

/**
 * Ключ дополнительного поля карточки, приведённый к одному виду: регистр,
 * «ё», запятые и хвосты вроде «, мм» роли не играют — оператор пишет их
 * как придётся.
 */
const normalizeKey = (key: string) =>
    key
        .toLowerCase()
        .replace(/ё/g, "е")
        .replace(/[^a-zа-я0-9]+/g, " ")
        .trim()

/**
 * Первое дополнительное поле карточки, чьё название содержит одно из искомых,
 * с уже разобранным числом. Ищем по вхождению — «Вес 1 погонного метра»
 * находится и как «вес 1 пог. метра, кг».
 */
function extraField(item: OrderItemForm, names: string[]) {
    const fields = item.product?.extra_fields
    if (!fields) return null
    const wanted = names.map(normalizeKey)
    for (const [key, value] of Object.entries(fields)) {
        const normalized = normalizeKey(key)
        if (!wanted.some((name) => normalized.includes(name))) continue
        const parsed = num(String(value ?? "").replace(",", "."))
        if (parsed > 0) return { key: normalized, value: parsed }
    }
    return null
}

const extraNumber = (item: OrderItemForm, names: string[]) =>
    extraField(item, names)?.value ?? 0

/**
 * кг/м of the picked product, theoretical or actual.
 *
 * Порядок источников — от самого точного к запасному:
 *   1. «Теор./факт. вес» карточки, если завод его завёл;
 *   2. «Вес 1 погонного метра» из доп. полей — у труб настоящий вес живёт
 *      именно там (ГОСТ, с учётом закруглений);
 *   3. `*_weight_used` бэкенда — он же считает вес по геометрии трубы, когда
 *      карточка пуста, и такой вес завышен: 100×50×4 даёт 8,918 вместо 8,701.
 */
export function weightPerMeter(item: OrderItemForm) {
    if (!item.product) return 0
    const theoretical =
        num(item.product.theoretical_weight) ||
        extraNumber(item, ["вес 1 погонного метра", "вес погонного метра"]) ||
        num(item.product.theoretical_weight_used)
    const actual =
        num(item.product.actual_weight) ||
        extraNumber(item, ["фактический вес", "факт вес"]) ||
        num(item.product.actual_weight_used)
    return weightMode(item) === "actual" ?
            actual || theoretical
        :   theoretical || actual
}

/** «Шт в пачке» карточки — сколько труб связывают в одну пачку. */
export function piecesPerPack(item: OrderItemForm) {
    return extraNumber(item, [
        "шт в пачке",
        "штук в пачке",
        "количество в пачке",
        "кол во в пачке",
    ])
}

/**
 * «Метров в пачке». Отдельного поля у карточки может не быть — тогда пачка
 * собирается из «Шт в пачке» × длина трубы. Длину карточка не хранит (одну и
 * ту же трубу катают разной длины), её подставляет форма из плана прокатки —
 * см. `usePipeLengths` в order-add-edit.
 */
export function metersPerPack(item: OrderItemForm) {
    const direct =
        num(item.product?.meters_per_pack) ||
        extraNumber(item, ["метров в пачке", "метр в пачке"])
    if (direct > 0) return direct

    const pieces = piecesPerPack(item)
    if (pieces <= 0) return 0

    // Длину пишут и в метрах, и в миллиметрах — «Длина трубы, мм» на экране
    // прокатки. Единицу берём из названия поля, а если её там нет — из
    // порядка числа: трубы длиннее сотни метров не бывает.
    const length = extraField(item, ["длина"])
    if (!length) return 0
    const inMm = /\bмм\b/.test(length.key) || length.value > 100
    return pieces * (inMm ? length.value / 1000 : length.value)
}

/** «Кол-во б. ед.» — the entered quantity converted to metres. */
export function quantityBase(item: OrderItemForm) {
    const quantity = num(item.quantity)
    if (item.unit === "pack") {
        return quantity * metersPerPack(item)
    }
    if (item.unit === "ton") {
        const perMeter = weightPerMeter(item)
        return perMeter > 0 ? (quantity * 1000) / perMeter : 0
    }
    return quantity
}

/**
 * Обратная сторона `quantityBase`: сколько это будет в единице строки.
 *
 * Смена «Ед. изм.» переводит количество, а не переосмысливает его: 5 000
 * метров — это те же 10 пачек по 500 м, поэтому «Кол-во б. ед.», вес и сумма
 * после переключения остаются прежними. Ноль означает «перевести нечем» —
 * тогда количество лучше не трогать.
 */
export function quantityInUnit(item: OrderItemForm, baseMeters: number) {
    if (baseMeters <= 0) return 0
    if (item.unit === "pack") {
        const perPack = metersPerPack(item)
        return perPack > 0 ? round3(baseMeters / perPack) : 0
    }
    if (item.unit === "ton") {
        const perMeter = weightPerMeter(item)
        return perMeter > 0 ? round3((baseMeters * perMeter) / 1000) : 0
    }
    return round3(baseMeters)
}

/** «Вес, тн» of the line — what the money is actually counted on. */
export function weightTn(item: OrderItemForm) {
    if (item.unit === "ton") return num(item.quantity)
    return (weightPerMeter(item) * quantityBase(item)) / 1000
}

/**
 * «Цена» из «Цены за Вес, Т»: ROUND(вес (кг/м) × цена за тонну / 1000, 3).
 * Строку в тоннах цена за тонну описывает как есть.
 */
export function priceFromPerTon(
    item: OrderItemForm,
    perTon = num(item.price_per_ton),
) {
    if (perTon <= 0) return 0
    if (item.unit === "ton") return perTon
    return round3((weightPerMeter(item) * perTon) / 1000)
}

/** Обратный ход: продавец назвал цену за метр — какая это цена за тонну. */
export function perTonFromPrice(item: OrderItemForm, price = num(item.price)) {
    if (price <= 0) return 0
    if (item.unit === "ton") return price
    const perMeter = weightPerMeter(item)
    return perMeter > 0 ? round3((price * 1000) / perMeter) : 0
}

/**
 * «Цена» за базовую единицу — за метр, а у строки в тоннах за тонну.
 *
 * Цену можно назвать и напрямую (как в МойСкладе: 7,07 за метр), и получить
 * из цены за тонну: поля пересчитывают друг друга при вводе, поэтому здесь
 * достаточно взять сохранённое число. Формула остаётся запасной — для строк,
 * где заполнена только цена за тонну.
 */
export function unitPrice(item: OrderItemForm) {
    return num(item.price) || priceFromPerTon(item)
}

/**
 * «Сумма» строки — цена × кол-во: цена за метр на метры, цена за тонну на
 * тонны. Скидка накладывается сверху.
 */
export function lineTotal(item: OrderItemForm) {
    const quantity =
        item.unit === "ton" ? num(item.quantity) : quantityBase(item)
    return unitPrice(item) * quantity * (1 - num(item.discount) / 100)
}

/**
 * Ставка НДС по умолчанию, % — стандартная ставка Узбекистана.
 *
 * Своя ставка у строки (`item.vat`) остаётся главнее, но её почти никогда не
 * заполняют: продавец включает «Учитывать НДС» на весь документ и ждёт, что
 * заказ посчитается по 12 %. Без этой подстановки ставка строки была нулевой,
 * и «В том числе НДС» показывал 0 при включённом флажке.
 */
export const DEFAULT_VAT_RATE = 12

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

    // Два флажка документа делят работу так, как их читает отдел продаж:
    //
    //   «НДС включён в цену» — считать ли налог вообще. Включён → «В том числе
    //     НДС» = сумма × 12 % (310,2 × 0,12 = 37,2), выключен → НДС нет.
    //   «Учитывать НДС» — ложится ли этот налог сверху на «Итого» или клиент
    //     платит ровно сумму строк.
    const vat =
        values.vat_included ?
            items.reduce((acc, item) => {
                const rate = num(item.vat) || DEFAULT_VAT_RATE
                if (rate <= 0) return acc
                return acc + (lineTotal(item) * rate) / 100
            }, 0)
        :   0

    const delivery = num(values.delivery_cost)
    const withVat = values.vat_enabled ? subtotal + vat : subtotal

    return {
        subtotal,
        vat,
        weight,
        delivery,
        grandTotal: withVat + delivery,
    }
}
