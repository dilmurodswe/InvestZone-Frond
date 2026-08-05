import type { AppendixTemplateFields } from "./appendix-types"
import type { TemplateKey } from "./appendix-variants"

/**
 * Shablonning boshlang'ich qiymatlari — «Приложение-1267» namunasidan olingan.
 *
 * Bular localStorage'da saqlanadi va chop etish oynasida tahrirlanadi, ya'ni
 * rekvizit o'zgarsa kodni qayta chiqarish shart emas.
 */
export const APPENDIX_TEMPLATE_DEFAULTS: AppendixTemplateFields = {
    seller: [
        "СП ООО «INVEST ZONE» 110300, Узбекистан, Ташкенская область, г. Ахангаран, Янглилик МФЙ Саноат Худуди, 50",
        "АКБ Яшнабадский филиал «Капиталбанк»,",
        "ИНН: 306732912, МФО:01158",
        "Р/С: 2020 8000 0051 2542 3001",
    ].join("\n"),
    manufacturer:
        'Трубный металлургический завод СП ООО "INVEST ZONE", Республика Узбекистан',
    direction: "Республика Узбекистан",
    deliveryTerms: "CPT, Перевозка оплачено за счет Продавца",
    goodsDescription: [
        "Стальная электросварная труба прямошовная Круглого сечения",
        "Стальная электросварная труба прямошовная Квадратного сечения",
        "Стальная электросварная труба прямошовная Прямоугольного сечения",
    ].join("\n"),
    specsLeft: [
        "Станд. на тех. Требов: ГОСТ 10705–80",
        "_: ГОСТ 3262–75",
        "Станд. на марку Стали: ГОСТ 1050–2013",
        "Станд. на Сортамент: ГОСТ 10704–91",
        "Категория: Обычная",
    ].join("\n"),
    specsRight: [
        "Станд. на тех. Требов: ГОСТ 13663–86",
        "Станд. на марку Стали: ГОСТ 1050–2013",
        "Станд. на Сортамент: ГОСТ 8639–82",
        "_: ГОСТ 8645–68",
        "Категория: Обычная",
    ].join("\n"),
    packaging: "Стандартная",
    marking: "Стандартная",
    paymentTermsText:
        "Расчеты по договору осуществляются через аккредитив, открытый Покупателем в пользу Продавца на полную сумму договора, в соответствии с условиями, согласованными сторонами.",
    specialTerms: [
        "1. Валюта платежа: Доллар США",
        "2. Сумма указано с учётом НДС.",
        "3. В случае если Покупатель осуществляет самовывоз Товара и не располагает необходимыми средствами для его безопасной погрузки, Продавец вправе использовать обязательные рамы или бруски для обеспечения сохранности груза. Стоимость таких материалов подлежит включению в счет, оплачиваемый Покупателем, и возврату они не подлежат.",
    ].join("\n"),
    defaultUnit: "тн",

    sellerShortName: "INVEST ZONE JV LLC",
    sellerInn: "306732912",
    sellerPostal:
        "СП ООО «INVEST ZONE», 110300, Узбекистан, Ташкенская область, г. Ахангаран, Янглилик МФЙ Саноат Худуди, 50, ИНН: 306732912, тел. +998911370004",
    releaseAllowedBy: "Главный финансист Шахакимов М.А.",
}

/**
 * «Приложение для проката» — o'sha blank, boshqa tovar.
 *
 * Prokat quvur emas: tavsifi bitta qatorga sig'adi, ГОСТ'lari boshqa, va
 * uchinchi «особое условие» (o'zi olib ketishda ramka-bruslar) unga tegishli
 * emas — namunadagi qog'ozda u yo'q. Quvur shabloni bilan bir joyda saqlansa,
 * har safar biri ikkinchisini bosib ketardi, shuning uchun kaliti alohida.
 */
export const ROLLED_TEMPLATE_DEFAULTS: AppendixTemplateFields = {
    ...APPENDIX_TEMPLATE_DEFAULTS,
    goodsDescription: "ПРОКАТ ТОНКОЛИСТОВОЙ ИЗ СТАЛИ ОБЩЕГО НАЗНАЧЕНИЯ",
    specsLeft: [
        "Станд. на тех. Требов: ГОСТ 14918–2020",
        "_: ГОСТ 9045–93",
        "Станд. на марку Стали: ГОСТ 1050–2013",
        "Категория: Обычная",
    ].join("\n"),
    specsRight: [
        "Станд. на тех. Требов: ГОСТ 16523-97",
        "Станд. на Сортамент: ГОСТ 19904-90",
        "_: ГОСТ 19903-74",
        "Категория: Обычная",
    ].join("\n"),
    specialTerms: [
        "1. Валюта платежа: Доллар США",
        "2. Сумма указано с учётом НДС.",
    ].join("\n"),
}

export const TEMPLATE_DEFAULTS: Record<TemplateKey, AppendixTemplateFields> = {
    pipe: APPENDIX_TEMPLATE_DEFAULTS,
    rolled: ROLLED_TEMPLATE_DEFAULTS,
}

const TEMPLATE_KEYS = Object.keys(
    APPENDIX_TEMPLATE_DEFAULTS,
) as (keyof AppendixTemplateFields)[]

/**
 * Chop etish oynasining qiymatlaridan saqlanadigan qismini ajratib oladi.
 *
 * Qo'lda sanab yozilganda yangi maydon qo'shilishi bilan u saqlanmay qolardi
 * va foydalanuvchi «nega yozganim esda qolmadi» deb hayron bo'lardi.
 */
export function pickTemplate(
    values: AppendixTemplateFields,
): AppendixTemplateFields {
    const template = {} as AppendixTemplateFields
    for (const key of TEMPLATE_KEYS) template[key] = values[key]
    return template
}
