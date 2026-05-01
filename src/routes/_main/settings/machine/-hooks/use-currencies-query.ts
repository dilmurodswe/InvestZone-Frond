import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import { useSearch } from "@tanstack/react-router"
import type { Currency } from "../-types"

export const useCurrenciesQuery = () => {
    const params = useSearch({ strict: false })
    const res = useGet<Currency[]>(API.SETTINGS.MACHINE.INDEX, {
        params,
    })
    const currencyList = getArray<Currency>(res.data)

    return { ...res, currencyList }
}
