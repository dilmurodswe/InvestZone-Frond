import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
    APPENDIX_TEMPLATE_DEFAULTS,
    TEMPLATE_DEFAULTS,
} from "./appendix-defaults"
import type { AppendixTemplateFields } from "./appendix-types"
import type { TemplateKey } from "./appendix-variants"

type Templates = Record<TemplateKey, AppendixTemplateFields>

type State = {
    templates: Templates
    setTemplate: (key: TemplateKey, template: AppendixTemplateFields) => void
    reset: (key: TemplateKey) => void
}

const withDefaults = (saved?: Partial<Templates>): Templates => ({
    pipe: { ...TEMPLATE_DEFAULTS.pipe, ...(saved?.pipe ?? {}) },
    rolled: { ...TEMPLATE_DEFAULTS.rolled, ...(saved?.rolled ?? {}) },
})

/**
 * Shablon maydonlari brauzerda saqlanadi: rekvizit, ГОСТ ro'yxati, to'lov
 * sharti va h.k. har bir hujjatda qaytadan yozilmasin.
 *
 * Blank turiga qarab alohida saqlanadi: quvur ilovasining ГОСТ'lari prokat
 * ilovasinikini bosib ketmasligi kerak — ular hech qachon bir xil emas.
 */
export const useAppendixTemplate = create<State>()(
    persist(
        (set) => ({
            templates: withDefaults(),
            setTemplate: (key, template) =>
                set((state) => ({
                    templates: { ...state.templates, [key]: template },
                })),
            reset: (key) =>
                set((state) => ({
                    templates: {
                        ...state.templates,
                        [key]: TEMPLATE_DEFAULTS[key],
                    },
                })),
        }),
        {
            name: "appendix-template",
            version: 2,
            // Yangi maydon qo'shilsa, saqlangan eski obyektda u bo'lmaydi —
            // shuning uchun har doim standart qiymatlar ustiga qo'yiladi.
            // v1'da bitta shablon saqlanardi (`template`) va u quvur blankiga
            // tegishli edi — o'sha yozuv `pipe` bo'lib ko'chiriladi.
            merge: (persisted, current) => {
                const saved = persisted as
                    | {
                          templates?: Partial<Templates>
                          template?: Partial<AppendixTemplateFields>
                      }
                    | undefined
                const legacy =
                    saved?.template ?
                        {
                            pipe: {
                                ...APPENDIX_TEMPLATE_DEFAULTS,
                                ...saved.template,
                            },
                        }
                    :   undefined
                return {
                    ...(current as State),
                    templates: withDefaults(saved?.templates ?? legacy),
                }
            },
        },
    ),
)
