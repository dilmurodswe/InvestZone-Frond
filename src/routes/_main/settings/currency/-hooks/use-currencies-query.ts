import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import { useSearch } from "@tanstack/react-router"
import type { Currency } from "../-types"

export const useCurrenciesQuery = () => {
    const params = useSearch({ strict: false })
    const res = useGet<{ count: number; results: Currency[] }>(
        API.SETTINGS.CURRENCY.INDEX,
        {
            params: { page_size: 20, ...params },
        },
    )
    const currencyList = getArray<Currency>(res.data?.results)

    return { ...res, currencyList }
}
