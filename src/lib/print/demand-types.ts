/**
 * Otgruzka (Расходная накладная / ТТН) chop etish formalarining ma'lumoti.
 *
 * Ilova (`appendix-types`) bilan bir xil printsip: hujjatdan keladigan qism va
 * blankda deyarli o'zgarmaydigan qism bitta tekis obyektga yig'iladi. Farqi —
 * bu yerda transport rekvizitlari bor: mashina, haydovchi, yuklash-tushirish
 * nuqtalari; ularni backend hozircha saqlamaydi va chop etish oynasida
 * to'ldiriladi.
 */

import type { AppendixTemplateFields } from "./appendix-types"

/** Otgruzkaning yettita qog'ozi. */
export type DemandVariant =
    | "expenseInvoice"
    | "ttnUzNew"
    | "ttn1T"
    | "ttnWeight"
    | "ttnRolled"
    | "ttn"
    | "ttnUzUnion"

export type DemandItem = {
    name: string
    unit: string
    quantity: number
    price: number
    total: number
    /** «Вес (кг)» ustuni — ТТН-Весовая uchun. */
    weightKg?: number
}

/** Har bir otgruzkada o'zgaradigan maydonlar. */
export type DemandDocumentFields = {
    /** Hujjat raqami va sanasi — sarlavhada. */
    number: string
    docDate: string
    /** Firma blankidagi ТТН sarlavhasi uchun — qaysi ilovaga tegishli. */
    appendixNumber: string
    appendixVersion: string
    appendixDate: string
    contractNumber: string
    lotNumber: string

    buyerName: string
    buyerInn: string
    /** Xaridorning to'liq rekviziti — «Расходная накладная» sarlavhasida. */
    buyerDetails: string
    /** Ko'p qatorli: nomi, bank, ИНН/МФО, Р/С. */
    consignee: string
    warehouseName: string

    /** Transport bo'limi. */
    transportType: string
    carModel: string
    carNumber: string
    driver: string
    carrier: string
    waybillNumber: string
    contractLine: string
    loadingPoint: string
    loadingPoint2: string
    unloadingPoint: string
    unloadingPoint2: string
    redirection: string
    newConsigneeAddress: string
    /** Yuk hujjat bilan ketadimi, o'ram turi va h.k. */
    cargoDocuments: string
    packageKind: string
    placesCount: string
    weightMethod: string
    cargoClass: string
    /** «Сдал» / «Отпуск произвел». */
    executor: string
}

export type DemandData = DemandDocumentFields &
    AppendixTemplateFields & {
        variant: DemandVariant
        items: DemandItem[]
        total: number
        currency: string
    }
