import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import { useSearch } from "@tanstack/react-router"
import type { Order } from "../-types"

export const useOrdersQuery = () => {
    const params = useSearch({ strict: false })
    const res = useGet<{ count: number; results: Order[] }>(API.ORDERS.INDEX, {
        params,
    })
    const orderList = getArray<Order>(res.data?.results)
    return { ...res, orderList }
}
