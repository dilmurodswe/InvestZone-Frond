import { create } from "zustand"
import { persist } from "zustand/middleware"
import { APPENDIX_TEMPLATE_DEFAULTS } from "./appendix-defaults"
import type { AppendixTemplateFields } from "./appendix-types"

type State = {
    template: AppendixTemplateFields
    setTemplate: (template: AppendixTemplateFields) => void
    reset: () => void
}

/**
 * Shablon maydonlari brauzerda saqlanadi: rekvizit, ГОСТ ro'yxati, to'lov
 * sharti va h.k. har bir hujjatda qaytadan yozilmasin.
 */
export const useAppendixTemplate = create<State>()(
    persist(
        (set) => ({
            template: APPENDIX_TEMPLATE_DEFAULTS,
            setTemplate: (template) => set({ template }),
            reset: () => set({ template: APPENDIX_TEMPLATE_DEFAULTS }),
        }),
        {
            name: "appendix-template",
            version: 1,
            // Yangi maydon qo'shilsa, saqlangan eski obyektda u bo'lmaydi —
            // shuning uchun har doim standart qiymatlar ustiga qo'yiladi.
            merge: (persisted, current) => ({
                ...current,
                template: {
                    ...APPENDIX_TEMPLATE_DEFAULTS,
                    ...((persisted as State | undefined)?.template ?? {}),
                },
            }),
        },
    ),
)
