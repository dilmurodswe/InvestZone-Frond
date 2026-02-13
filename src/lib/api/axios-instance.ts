import { QueryClient } from "@tanstack/react-query"
import axios from "axios"
import Cookies from "js-cookie"
import { API } from "../constants/api-endpoints"
import { BASE_URL } from "../constants/base-url"
import { COOKIES } from "../constants/cookies"
import { CookieService } from "../utils/cookie-service"

const lang = Cookies.get(COOKIES.LANGUAGE)

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "Accept-Language": lang || "ru",
    },
    formSerializer: {
        indexes: null,
    },
    paramsSerializer: {
        indexes: null,
    },
    // withCredentials: true,
})

export function setupAxiosInterceptors(_queryClient: QueryClient) {
    // Add a request interceptor
    axiosInstance.interceptors.request.use(
        function (config) {
            const token = CookieService.getAccessToken()
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
            return config
        },
        function (error) {
            return Promise.reject(error)
        },
    )

    // Add a response interceptor
    axiosInstance.interceptors.response.use(
        function (response) {
            return response
        },
        async function (error) {
            const originalRequest = error.config
            const status = error.response?.status

            if (status === 401 && !originalRequest._retry) {
                originalRequest._retry = true
                try {
                    const refresh = CookieService.getRefreshToken()
                    if (refresh) {
                        const refreshResponse = await axios.post(
                            BASE_URL + API.AUTH.REFRESH.INDEX,
                            {
                                refresh_token: refresh,
                            },
                        )
                        const accessToken: string =
                            refreshResponse?.data?.access_token
                        const refreshToken: string =
                            refreshResponse?.data?.refresh_token
                        CookieService.setRefreshToken(refreshToken)
                        if (accessToken) {
                            CookieService.setAccessToken(accessToken)
                            // Retry the original request
                            originalRequest.headers.Authorization = `Bearer ${accessToken}`
                            return axiosInstance(originalRequest)
                        }
                    } else {
                        if (typeof window !== "undefined") {
                            location.replace("/login")
                        }
                    }
                } catch (refreshError) {
                    CookieService.removeAccessToken()
                    CookieService.removeRefreshToken()
                    // localStorage.removeItem(LS.USER_ACCESS)
                    // localStorage.removeItem(LS.USER_REFRESH)
                    location.replace("/login")
                    return Promise.reject(refreshError)
                }
            }

            // if (status === 403) {
            //     if (!originalRequest._403retry) {
            //         originalRequest._403retry = true
            //         // Invalidate and wait for refetch to complete
            //         await queryClient.invalidateQueries({
            //             queryKey: [GET_ME],
            //         })

            //         // Wait a small delay to ensure the query is refetched
            //         await new Promise((resolve) => setTimeout(resolve, 100))
            //         return axiosInstance(originalRequest)
            //     }
            // }
            return Promise.reject(error)
        },
    )
}

export default axiosInstance
