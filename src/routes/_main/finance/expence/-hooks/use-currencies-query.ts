import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { ExpenseCurrency } from "../-types"

export const useCurrenciesQuery = () => {
    const res = useGet<{ count: number; results: ExpenseCurrency[] }>(
        API.SETTINGS.CURRENCY.INDEX,
    )
    const currencyList = getArray<ExpenseCurrency>(res.data?.results)
    return { ...res, currencyList }
}
