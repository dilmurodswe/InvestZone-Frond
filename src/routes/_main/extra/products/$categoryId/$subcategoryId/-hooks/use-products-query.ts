import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { PaginatedResponse } from "@/types/common"
import { useParams, useSearch } from "@tanstack/react-router"
import type { Product } from "../../../-types"

export const useProductsQuery = () => {
    const params = useSearch({ strict: false })
    const { categoryId, subcategoryId } = useParams({ strict: false })

    const res = useGet<PaginatedResponse<Product>>(API.EXTRA.PRODUCTS.INDEX, {
        params: {
            ...params,
            category: categoryId,
            sub_category: subcategoryId,
        },
    })
    const productList = getArray(res.data?.results)

    return { ...res, productList }
}
