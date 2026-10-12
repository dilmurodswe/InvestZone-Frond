import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import { useSearch } from "@tanstack/react-router"
import type { Expense } from "../-types"
import { withoutDisplayCurrency } from "../../-hooks/use-display-currency"

export const useExpensesQuery = () => {
    const params = useSearch({ strict: false })
    const res = useGet<{ count: number; results: Expense[] }>(
        API.FINANCE.EXPENSE.INDEX,
        {
            params: { page_size: 20, ...withoutDisplayCurrency(params) },
        },
    )
    const expenseList = getArray<Expense>(res.data?.results)
    return { ...res, expenseList }
}
