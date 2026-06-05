import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import { useSearch } from "@tanstack/react-router"
import type { Income } from "../-types"

export const useIncomesQuery = () => {
    const params = useSearch({ strict: false })
    const res = useGet<{ count: number; results: Income[] }>(
        API.FINANCE.INCOME.INDEX,
        {
            params: { page_size: 20, ...params },
        },
    )
    const incomeList = getArray<Income>(res.data?.results)
    return { ...res, incomeList }
}
