import { API } from "@/lib/constants/api-endpoints"
import type { Profile } from "@/types/profile"
import { useGet } from "./use-get"
import { useRevalidate } from "./use-revalidate"

export const useProfileQuery = () => {
    const { queryClient } = useRevalidate()
    // const accessToken = CookieService.getAccessToken()
    const res = useGet<Profile>(API.AUTH.ME.INDEX, {
        options: {
            // enabled: !!accessToken,
        },
    })
    const isAuthenticated =
        !res.error && !!Object.entries(res.data || {}).length && res.isFetched
    const updateProfileQueryCache = (vals: Partial<Profile>) => {
        queryClient.setQueryData([""], (prev) =>
            prev ? { ...prev, ...vals } : prev,
        )
    }
    const isAdmin = res?.data?.role === "admin"
    const isManager = res?.data?.role === "office_manager"

    return {
        ...res,
        isAuthenticated,
        updateProfileQueryCache,
        isAdmin,
        isManager,
    }
}
