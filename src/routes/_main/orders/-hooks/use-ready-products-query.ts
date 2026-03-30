import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { ReadyProduct } from "../-types"

export const useReadyProductsQuery = () => {
    const res = useGet<{ count: number; results: ReadyProduct[] }>(
        API.MANUFACTURES.READY_PRODUCTS,
    )
    const readyProductList = getArray<ReadyProduct>(res.data?.results)
    return { ...res, readyProductList }
}
