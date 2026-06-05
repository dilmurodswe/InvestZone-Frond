import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import { useSearch } from "@tanstack/react-router"
import type { Category } from "../-types"

export const useCategoriesQuery = () => {
    const params = useSearch({ strict: false })
    const res = useGet<Category[]>(API.EXTRA.CATEGORIES.INDEX, {
        params: { page_size: 20, ...params },
    })
    const categoryList = getArray<Category>(res.data)

    return { ...res, categoryList }
}
