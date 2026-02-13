import { COOKIES } from "@/lib/constants/cookies"
import { languages } from "@/lib/constants/options"
import i18n from "@/lib/i18n/request"
import type { Language } from "@/types/language"
import Cookies from "js-cookie"
import React, { createContext, useEffect, useState } from "react"

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
}

// Initial context: undefined (buni hook ichida tekshiramiz)
// eslint-disable-next-line react-refresh/only-export-components
export const LanguageContext = createContext<LanguageContextType | undefined>(
    undefined,
)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const cookieValue = Cookies.get(COOKIES.LANGUAGE)
        const found = languages.find((l) => l.value === cookieValue)
        return found ?? languages[0]
    })

    const setLanguage = (lang: Language) => {
        Cookies.set(COOKIES.LANGUAGE, lang.value)
        setLanguageState(lang)
        i18n.changeLanguage(lang.value)
        location.reload()
    }

    const value = { language, setLanguage }

    useEffect(() => {
        const cookieValue = Cookies.get(COOKIES.LANGUAGE)
        const found = languages.find((l) => l.value === cookieValue)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLanguageState(found ?? languages[0])
        i18n.changeLanguage(found?.value ?? languages[0].value)
    }, [])

    return <LanguageContext value={value}>{children}</LanguageContext>
}
