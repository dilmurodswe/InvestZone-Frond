import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { IncomeCurrency } from "../-types"

export const useCurrenciesQuery = () => {
    const res = useGet<{ count: number; results: IncomeCurrency[] }>(
        API.SETTINGS.CURRENCY.INDEX,
    )
    const currencyList = getArray<IncomeCurrency>(res.data?.results)
    return { ...res, currencyList }
}
