import { makeQueryKey } from "@/hooks/react-query/make-query-key"
import { useGet } from "@/hooks/react-query/use-get"
import { getRequest } from "@/lib/api/default-requests"
import { API } from "@/lib/constants/api-endpoints"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

export type UsdRate = {
    /** USD -> UZS market rate. */
    rate: number
    /** "open.er-api.com" for a live pull, "system" for the DB fallback. */
    source: string
    fetched_at: string
    cached?: boolean
    /** true when the live provider was unreachable and this is a fallback. */
    stale?: boolean
}

/**
 * Live USD -> UZS market rate, used to pre-fill the rate field on the
 * Kirim/Chiqim forms. The initial read uses the backend's few-hour cache so
 * the modal opens instantly; `refreshRate()` (the "refresh" button) forces a
 * fresh pull from the provider and updates the cached value.
 */
export const useUsdRateQuery = () => {
    const queryClient = useQueryClient()
    const [isRefreshing, setIsRefreshing] = useState(false)

    const res = useGet<UsdRate>(API.FINANCE.USD_RATE.INDEX, {
        options: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
            retry: 1,
        },
    })

    const refreshRate = async (): Promise<UsdRate | undefined> => {
        setIsRefreshing(true)
        try {
            const fresh = await getRequest(API.FINANCE.USD_RATE.INDEX, {
                params: { refresh: 1 },
            })
            queryClient.setQueryData(
                makeQueryKey({ url: API.FINANCE.USD_RATE.INDEX }),
                fresh,
            )
            return fresh as UsdRate
        } finally {
            setIsRefreshing(false)
        }
    }

    return { ...res, usdRate: res.data, refreshRate, isRefreshing }
}
