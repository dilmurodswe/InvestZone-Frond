import Cookies from "js-cookie"
import { COOKIES } from "../constants/cookies"

// Cookie configuration for better security
const cookieOptions: (typeof Cookies)["attributes"] = {
    secure: import.meta.env.MODE === "production", // Only transmitted over HTTPS
    sameSite: "strict", // Protect against CSRF
    path: "/", // Available across the site
}

export const CookieService = {
    // Access Token methods
    getAccessToken: (): string | undefined => {
        return Cookies.get(COOKIES.ACCESS_TOKEN)
    },

    setAccessToken: (token: string): void => {
        Cookies.set(COOKIES.ACCESS_TOKEN, token, {
            ...cookieOptions,
            expires: 1, // 30 days
        })
    },

    removeAccessToken: (): void => {
        Cookies.remove(COOKIES.ACCESS_TOKEN, { path: "/" })
    },

    // Refresh Token methods
    getRefreshToken: (): string | undefined => {
        return Cookies.get(COOKIES.REFRESH_TOKEN)
    },

    setRefreshToken: (token: string): void => {
        Cookies.set(COOKIES.REFRESH_TOKEN, token, {
            ...cookieOptions,
            expires: 30, // 30 days
        })
    },

    removeRefreshToken: (): void => {
        Cookies.remove(COOKIES.REFRESH_TOKEN, { path: "/" })
    },

    // Utility methods
    clearAllTokens: (): void => {
        CookieService.removeAccessToken()
        CookieService.removeRefreshToken()
    },

    hasTokens: (): boolean => {
        return !!(
            CookieService.getAccessToken() && CookieService.getRefreshToken()
        )
    },
}
