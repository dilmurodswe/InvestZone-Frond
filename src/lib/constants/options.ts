import EnFlag from "@/assets/icons/flag_en.svg"
import RuFlag from "@/assets/icons/flag_ru.svg"
import type { Language } from "@/types/language"

export const languages: Language[] = [
    {
        value: "ru",
        label: "Ru",
        scr: RuFlag,
    },
    {
        value: "en",
        label: "En",
        scr: EnFlag,
    },
]
