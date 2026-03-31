import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { Income } from "../-types"

export const useIncomesQuery = () => {
    const res = useGet<{ count: number; results: Income[] }>(
        API.FINANCE.INCOME.INDEX,
    )
    const incomeList = getArray<Income>(res.data?.results)
    return { ...res, incomeList }
}
