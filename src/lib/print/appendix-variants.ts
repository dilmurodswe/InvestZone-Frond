/**
 * Chop etishning besh formasi — «Печать» menyusidagi ro'yxat.
 *
 * Hammasi bitta buyurtmadan chiqadi va bitta oyna orqali to'ldiriladi; bu
 * yerda faqat ularning farqi yozilgan: qaysi blankda chiziladi, qaysi shablonni
 * ishlatadi va chop etish oynasida qaysi bo'limlar kerak.
 */

import type { AppendixVariant } from "./appendix-types"

/**
 * Saqlanadigan shablon kaliti. Quvur va prokat ilovalari bir xil blankda
 * chiziladi, lekin ГОСТ'lari va tovar tavsifi boshqa — shuning uchun ularning
 * shabloni ham alohida saqlanadi va biri ikkinchisini bosib ketmaydi.
 */
export type TemplateKey = "pipe" | "rolled"

/** Qog'ozning tuzilishi: uchta har xil blank bor, beshta forma emas. */
export type AppendixLayout = "classic" | "draft" | "priceCheck"

/** Chop etish oynasida shu formaga kerakli bo'limlar. */
export type VariantSections = {
    /** Поставщик, Производитель, Исполнитель. */
    seller: boolean
    /** Грузополучатель. */
    consignee: boolean
    /** Условие поставки, Направление, Ед. изм. */
    delivery: boolean
    /** Описание товара va ГОСТ ro'yxatlari. */
    goods: boolean
    /** Упаковка va Маркировка. */
    packaging: boolean
    /** Условие оплаты va Особые условия. */
    paymentTerms: boolean
}

export type VariantMeta = {
    /** Qog'ozdagi nomi — u menyuda ham, oynaning sarlavhasida ham ko'rinadi. */
    label: string
    layout: AppendixLayout
    template: TemplateKey
    sections: VariantSections
    /** `classic` blankdagi «Кол-во» ustuni sarlavhasi. */
    quantityTitle?: string
    /** Yuklab olinadigan fayl nomining boshi. */
    fileNamePrefix: string
}

const ALL: VariantSections = {
    seller: true,
    consignee: true,
    delivery: true,
    goods: true,
    packaging: true,
    paymentTerms: true,
}

const NONE: VariantSections = {
    seller: false,
    consignee: false,
    delivery: false,
    goods: false,
    packaging: false,
    paymentTerms: false,
}

export const PRINT_VARIANTS: Record<AppendixVariant, VariantMeta> = {
    appendix: {
        label: "Приложение",
        layout: "classic",
        template: "pipe",
        sections: ALL,
        fileNamePrefix: "Приложение",
    },
    rolled: {
        label: "Приложение для проката",
        layout: "classic",
        template: "rolled",
        sections: ALL,
        fileNamePrefix: "Приложение-прокат",
    },
    production: {
        label: "Приложение-Производство",
        layout: "classic",
        template: "pipe",
        sections: ALL,
        // Ishlab chiqarishga ketadigan nusxada miqdor dopusk bilan: rulonni
        // metrma-metr o'lchab kesib bo'lmaydi.
        quantityTitle: "Кол-во\n±10%",
        fileNamePrefix: "Приложение-производство",
    },
    draft: {
        label: "Draft",
        layout: "draft",
        template: "pipe",
        // Ichki qoralama: rekvizit ham, ГОСТ ham kerak emas — faqat raqamlar.
        sections: NONE,
        fileNamePrefix: "Draft",
    },
    priceCheck: {
        label: "Проверка цены",
        layout: "priceCheck",
        template: "pipe",
        sections: {
            ...NONE,
            consignee: true,
            delivery: true,
            paymentTerms: true,
        },
        fileNamePrefix: "Проверка-цены",
    },
}

/** Menyudagi tartib — foydalanish chastotasi bo'yicha. */
export const PRINT_VARIANT_ORDER: AppendixVariant[] = [
    "appendix",
    "rolled",
    "production",
    "draft",
    "priceCheck",
]

/** «Печать ▾» menyusiga tayyor ro'yxat. */
export const printMenuOptions = () =>
    PRINT_VARIANT_ORDER.map((id) => ({ id, label: PRINT_VARIANTS[id].label }))
