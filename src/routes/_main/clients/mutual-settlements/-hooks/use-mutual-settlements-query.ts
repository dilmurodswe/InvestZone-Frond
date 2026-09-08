import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import type { CurrencyCode, MutualSettlementsResponse } from "../../-types"

type Filters = {
    start: string
    end: string
    currency?: CurrencyCode
    client?: number | null
}

export const useMutualSettlementsQuery = ({
    start,
    end,
    currency,
    client,
}: Filters) => {
    const params: Record<string, string> = {
        start_date: start,
        end_date: end,
    }
    if (currency) params.currency = currency
    if (client) params.client = String(client)

    const res = useGet<MutualSettlementsResponse>(API.SALE.MUTUAL_SETTLEMENTS, {
        params,
        options: { staleTime: 0, refetchOnMount: "always" },
    })

    return { ...res, rows: res.data?.results ?? [] }
}
