import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { Expense } from "../-types"

export const useExpensesQuery = () => {
    const res = useGet<{ count: number; results: Expense[] }>(
        API.FINANCE.EXPENSE.INDEX,
    )
    const expenseList = getArray<Expense>(res.data?.results)
    return { ...res, expenseList }
}
