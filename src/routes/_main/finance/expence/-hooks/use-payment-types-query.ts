import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { PaymentType } from "../-types"

export const usePaymentTypesQuery = () => {
    const res = useGet<{ count: number; results: PaymentType[] }>(
        API.SETTINGS.PAYMENT_TYPE.INDEX,
    )
    const paymentTypeList = getArray<PaymentType>(res.data?.results)
    return { ...res, paymentTypeList }
}
