/**
 * «Приложение» — shartnomaga ilova qilinadigan chop etish formasi.
 *
 * Maydonlarning bir qismi hujjatning o'zidan (buyurtma/otgruzka) keladi,
 * qolganlari hozircha backendda yo'q va chop etish oynasida to'ldiriladi.
 * Shuning uchun bu tip ikkalasini bitta tekis obyektga yig'adi — renderer
 * ma'lumot qayerdan kelganini bilishi shart emas.
 */

export type AppendixItem = {
    name: string
    unit: string
    quantity: number
    price: number
    total: number
}

/** Har safar chop etilganda o'zgarib turadigan maydonlar. */
export type AppendixDocumentFields = {
    /** Sarlavhadagi «ДАТА ОТПРАВКИ» (yyyy-MM-dd). */
    shipmentDate: string
    contractNumber: string
    lotNumber: string
    appendixNumber: string
    appendixVersion: string
    /** «Срок поставки по … включительно» (yyyy-MM-dd). */
    deliveryDeadline: string
    buyerName: string
    /** Ko'p qatorli: nomi, bank, ИНН/МФО, Р/С. */
    consignee: string
    paymentTermsTitle: string
    executor: string
}

/** Hujjatdan hujjatga deyarli o'zgarmaydigan, shuning uchun eslab qolinadigan qism. */
export type AppendixTemplateFields = {
    seller: string
    manufacturer: string
    direction: string
    deliveryTerms: string
    goodsDescription: string
    /** Har bir qator `Nomi: Qiymati` ko'rinishida. */
    specsLeft: string
    specsRight: string
    packaging: string
    marking: string
    paymentTermsText: string
    specialTerms: string
    /** Jadvaldagi «Ед. изм» ustuni uchun standart qiymat. */
    defaultUnit: string
}

export type AppendixData = AppendixDocumentFields &
    AppendixTemplateFields & {
        items: AppendixItem[]
        total: number
        currency: string
    }
