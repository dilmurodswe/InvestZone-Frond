import { LanguageContext } from "@/providers/language-provider"
import { use } from "react"

export const useLanguage = () => {
    const context = use(LanguageContext)
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
}
