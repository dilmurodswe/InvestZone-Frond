import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { PaginatedResponse } from "@/types/common"
import { useSearch } from "@tanstack/react-router"
import type { ReadyProduct } from "../-types"

export const useReadyProductsQuery = () => {
    const params = useSearch({ strict: false })
    const res = useGet<PaginatedResponse<ReadyProduct>>(
        API.MANUFACTURES.READY_PRODUCTS,
        { params },
    )
    const readyProductList = getArray<ReadyProduct>(res.data?.results)
    const count = res.data?.count ?? 0
    return { ...res, readyProductList, count }
}
