/**
 * «Приложение» — shartnomaga ilova qilinadigan chop etish formasi.
 *
 * Maydonlarning bir qismi hujjatning o'zidan (buyurtma/otgruzka) keladi,
 * qolganlari hozircha backendda yo'q va chop etish oynasida to'ldiriladi.
 * Shuning uchun bu tip ikkalasini bitta tekis obyektga yig'adi — renderer
 * ma'lumot qayerdan kelganini bilishi shart emas.
 */

/**
 * Bitta buyurtmadan chiqadigan besh xil qog'oz. Ma'lumot bitta — farqi
 * blankda: xaridorga ketadigan ilova, prokat uchun o'z ГОСТ'lari bilan,
 * ishlab chiqarishga ±10 % dopusk bilan, ichki narx qoralamasi va narxni
 * tekshirish varag'i.
 */
export type AppendixVariant =
    | "appendix"
    | "rolled"
    | "production"
    | "draft"
    | "priceCheck"

export type AppendixItem = {
    name: string
    unit: string
    quantity: number
    price: number
    total: number

    /*
     * Quyidagilari faqat narx varaqlariga (Draft, «Проверка цены») kerak.
     * «Доставка» kabi tovarsiz qatorda ular bo'lmaydi — qog'ozda o'rniga
     * chiziqcha chiqadi, nol emas: nol hisoblangandek ko'rinardi.
     */

    /** кг/м — «Вес 1пм». */
    weightPerMeter?: number
    /** Pozitsiyaning metrdagi miqdori: narx varaqlari hammasini metrga soladi. */
    quantityMeters?: number
    /** «Цена за ТН» — metr narxidan qayta hisoblangan tonna narxi. */
    pricePerTon?: number
    /** «Цена за тн док» — hujjatning o'zida yozilgan tonna narxi. */
    pricePerTonDoc?: number
    /** «Цена за М» / «Цена за пм». */
    pricePerMeter?: number
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

    /*
     * Otgruzka qog'ozlari (Расходная накладная, ТТН) uchun — ilovada
     * ishlatilmaydi, lekin blanki bir xil bo'lgani uchun shu shablonda yashaydi.
     */

    /** «Грузоотправитель» — bir qatorli qisqa nom. */
    sellerShortName: string
    sellerInn: string
    /** «Поставщик» — pochta manzili va telefoni bilan bitta qator. */
    sellerPostal: string
    /** «Отпуск разрешил» — lavozimi va familiyasi. */
    releaseAllowedBy: string
}

export type AppendixData = AppendixDocumentFields &
    AppendixTemplateFields & {
        variant: AppendixVariant
        items: AppendixItem[]
        total: number
        currency: string
    }
