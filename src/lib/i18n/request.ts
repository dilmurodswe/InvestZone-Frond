import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import Cookies from "js-cookie"
import { initReactI18next } from "react-i18next"
import { COOKIES } from "../constants/cookies"
import en from "./locales/en.json"
import ru from "./locales/ru.json"
import uz from "./locales/uz.json"

const isDev = import.meta.env.DEV

const resources = {
    ru: { translation: ru },
    uz: { translation: uz },
    en: { translation: en },
}

const getInitialLanguage = () => {
    const storedLanguage = Cookies.get(COOKIES.LANGUAGE) // Cookie'dan tilni olish
    return storedLanguage || "ru" // Agar til cookie'da bo'lmasa, inglizcha tilni tanlash
}

i18n.use(LanguageDetector)
    .use(initReactI18next) // React bilan integratsiya
    .init({
        resources,
        lng: getInitialLanguage(), // Boshlang'ich tilni olish
        fallbackLng: "ru", // Agar kerakli til topilmasa
        interpolation: { escapeValue: false },
        debug: isDev,
        saveMissing: isDev,
    })

export default i18n
