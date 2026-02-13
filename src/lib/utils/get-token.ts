import { LS } from "@/lib/constants/localstorage"

export const getAccessToken = () => {
    const token = localStorage.getItem(LS.USER_ACCESS)
    return token
}
export const getRefreshToken = () => {
    const token = localStorage.getItem(LS.USER_REFRESH)
    return token
}
