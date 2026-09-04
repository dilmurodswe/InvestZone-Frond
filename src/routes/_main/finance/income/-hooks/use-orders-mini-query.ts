import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"

export type MiniOrder = {
    id: number
    number: string
    client: { id: number; full_name: string; company_name: string } | null
    currency: { id: number; currency: string } | null
    client_currency: string | null
    grand_total: string
}

export const useOrdersMiniQuery = () => {
    const res = useGet<{ results: MiniOrder[] }>(API.ORDERS.INDEX, {
        params: { page_size: 200 },
    })
    const orderList = getArray<MiniOrder>(res.data?.results)
    return { ...res, orderList }
}
