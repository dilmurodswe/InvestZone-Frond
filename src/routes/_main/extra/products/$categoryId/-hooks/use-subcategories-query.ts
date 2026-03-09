import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { PaginatedResponse } from "@/types/common"
import { useParams, useSearch } from "@tanstack/react-router"
import type { SubCategory } from "../../-types"

export const useSubCategoriesQuery = () => {
    const params = useSearch({ strict: false })
    const { categoryId } = useParams({ strict: false })

    const res = useGet<PaginatedResponse<SubCategory>>(
        API.EXTRA.SUBCATEGORIES.INDEX,
        {
            params: { ...params, category: categoryId },
        },
    )
    const subCategoryList = getArray(res.data?.results)

    return { ...res, subCategoryList }
}
