/**
 * Otgruzkaning «Печать» menyusi — yettita forma.
 *
 * To'rtta blank bor, formalar esa yettita: uchta ТТН bir xil firma blankida
 * chiqadi va faqat tovar tavsifi bilan «Вес (кг)» ustuni bilan farq qiladi.
 */

import type { TemplateKey } from "./appendix-variants"
import type { DemandVariant } from "./demand-types"

export type DemandLayout =
    /** «Расходная накладная» — tik varaq, sodda jadval, summa so'z bilan. */
    | "expenseInvoice"
    /** ТТН (Узбекистан, новая) — yotiq, yuk va avtotashish ustunlari bilan. */
    | "ttnUzNew"
    /** Типовая форма № 1-т — yotiq, davlat blanki. */
    | "ttn1T"
    /** Firma blankidagi ТТН — tik, rekvizit + ГОСТ + qisqa jadval. */
    | "ttnLetterhead"
    /** ttn_uz_union — yotiq, qisqartirilgan ТТН, muhr va imzo joyi bilan. */
    | "ttnUzUnion"

export type DemandVariantMeta = {
    /** Qog'ozdagi nomi — menyuda ham shu. */
    label: string
    layout: DemandLayout
    template: TemplateKey
    landscape: boolean
    /** Firma blankidagi ТТН jadvalida «Вес (кг)» ustuni bo'ladimi. */
    weightColumn?: boolean
    /** «Маркировка» ning shu forma uchun standart qiymati. */
    marking?: string
    fileNamePrefix: string
}

export const DEMAND_VARIANTS: Record<DemandVariant, DemandVariantMeta> = {
    expenseInvoice: {
        label: "Расходная накладная",
        layout: "expenseInvoice",
        template: "pipe",
        landscape: false,
        fileNamePrefix: "Расходная-накладная",
    },
    ttnUzNew: {
        label: "Товарно-транспортная накладная (Узбекистан, новая)",
        layout: "ttnUzNew",
        template: "pipe",
        landscape: true,
        fileNamePrefix: "ТТН-Узбекистан-новая",
    },
    ttn1T: {
        label: "Товарно-транспортная накладная (форма № 1-Т, Узбекистан)",
        layout: "ttn1T",
        template: "pipe",
        landscape: true,
        fileNamePrefix: "ТТН-форма-1-Т",
    },
    ttnWeight: {
        label: "ТТН-Весовая",
        layout: "ttnLetterhead",
        template: "pipe",
        landscape: false,
        weightColumn: true,
        marking: "Весовая",
        fileNamePrefix: "ТТН-Весовая",
    },
    ttnRolled: {
        label: "ТТН Прокат",
        layout: "ttnLetterhead",
        template: "rolled",
        landscape: false,
        fileNamePrefix: "ТТН-Прокат",
    },
    ttn: {
        label: "ТТН",
        layout: "ttnLetterhead",
        template: "pipe",
        landscape: false,
        fileNamePrefix: "ТТН",
    },
    ttnUzUnion: {
        label: "ttn_uz_union",
        layout: "ttnUzUnion",
        template: "pipe",
        landscape: true,
        fileNamePrefix: "ttn_uz_union",
    },
}

/** «Печать ▾» menyusiga tayyor ro'yxat. */
export const demandMenuOptions = () =>
    DEMAND_VARIANT_ORDER.map((id) => ({ id, label: DEMAND_VARIANTS[id].label }))

/** Menyudagi tartib — МойСклад'dagi kabi. */
export const DEMAND_VARIANT_ORDER: DemandVariant[] = [
    "expenseInvoice",
    "ttnUzNew",
    "ttn1T",
    "ttnWeight",
    "ttnRolled",
    "ttn",
    "ttnUzUnion",
]
