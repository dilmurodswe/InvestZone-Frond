import { LS } from "@/lib/constants/localstorage"

export const setAccessToken = (token: string) => {
    localStorage.setItem(LS.USER_ACCESS, token)
}
export const setRefreshToken = (token: string) => {
    localStorage.setItem(LS.USER_REFRESH, token)
}
