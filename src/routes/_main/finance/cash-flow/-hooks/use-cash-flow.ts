import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import type { CashCurrency, CashFlowResponse } from "../-types"

type Filters = {
    paymentType: string
    currency: CashCurrency | ""
    start: string
    end: string
}

export const useCashFlowQuery = ({
    paymentType,
    currency,
    start,
    end,
}: Filters) => {
    const params: Record<string, string> = {
        start_date: start,
        end_date: end,
    }
    if (paymentType) params.payment_type = paymentType
    if (currency) params.currency = currency

    const res = useGet<CashFlowResponse>(API.FINANCE.CASH_FLOW.INDEX, {
        params,
        options: { staleTime: 0, refetchOnMount: "always" },
    })

    return {
        ...res,
        rows: res.data?.rows ?? [],
        opening: res.data?.opening ?? {},
        closing: res.data?.closing ?? {},
    }
}
