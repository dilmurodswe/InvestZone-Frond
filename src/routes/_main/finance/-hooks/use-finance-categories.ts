import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"

export type FinanceKind = "income" | "expense"

export type FinanceCategory = {
    id: number
    name: string
    kind: FinanceKind
    parent: number | null
    is_active: boolean
}

/** Top-level finance categories for the given kind (income | expense). */
export const useFinanceCategoriesQuery = (kind: FinanceKind) => {
    const res = useGet<FinanceCategory[] | { results: FinanceCategory[] }>(
        API.FINANCE.CATEGORIES.INDEX,
        { params: { kind } },
    )
    const categoryList = getArray<FinanceCategory>(
        Array.isArray(res.data) ? res.data : res.data?.results,
    )
    return { ...res, categoryList }
}

/** Subcategories of a chosen category. Disabled until `category` is set. */
export const useFinanceSubcategoriesQuery = (category: number | null) => {
    const res = useGet<FinanceCategory[] | { results: FinanceCategory[] }>(
        API.FINANCE.SUBCATEGORIES.INDEX,
        {
            params: { category: category ?? "" },
            options: { enabled: !!category },
        },
    )
    const subcategoryList = getArray<FinanceCategory>(
        Array.isArray(res.data) ? res.data : res.data?.results,
    )
    return { ...res, subcategoryList }
}
