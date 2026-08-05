import { create } from "zustand"
import type { AppendixVariant } from "./appendix-types"
import type { DemandVariant } from "./demand-types"

type State = {
    variant: AppendixVariant
    setVariant: (variant: AppendixVariant) => void
}

type DemandState = {
    variant: DemandVariant
    setVariant: (variant: DemandVariant) => void
}

/**
 * «Печать» menyusida tanlangan forma.
 *
 * Modal oynasi ilovaning ildizida bir marta chiziladi va uni ochadigan tugma
 * har xil joyda (ro'yxat qatori, hujjat oynasi, tahrirlash formasi) turadi —
 * shuning uchun tanlov proplar bilan emas, shu kichik do'kon orqali yetkaziladi.
 */
export const usePrintVariant = create<State>((set) => ({
    variant: "appendix",
    setVariant: (variant) => set({ variant }),
}))

/** O'shanday, faqat otgruzkaning yettita formasi uchun. */
export const useDemandPrintVariant = create<DemandState>((set) => ({
    variant: "expenseInvoice",
    setVariant: (variant) => set({ variant }),
}))
