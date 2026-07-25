import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type {
    PaymentType,
    SaleClient,
    SaleCurrency,
} from "@/routes/_main/orders/-types"
import type { PaginatedResponse } from "@/types/common"
import { useGet } from "./use-get"

/**
 * Reference data shared by every sales document (order, demand).
 *
 * These lists are small and fully loaded up front. Large lists (products,
 * warehouses) are paged on demand through {@link usePaginatedSelect} instead.
 */

const SELECT_PAGE_SIZE = 1000

export const useSaleClientsQuery = () => {
    const res = useGet<PaginatedResponse<SaleClient>>(API.CLIENT.USERS.INDEX, {
        params: { page_size: SELECT_PAGE_SIZE },
    })
    return { ...res, clientList: getArray<SaleClient>(res.data?.results) }
}

export const useSalePaymentTypesQuery = () => {
    const res = useGet<PaginatedResponse<PaymentType>>(
        API.SETTINGS.PAYMENT_TYPE.INDEX,
        { params: { page_size: SELECT_PAGE_SIZE } },
    )
    return {
        ...res,
        paymentTypeList: getArray<PaymentType>(res.data?.results),
    }
}

export const useSaleCurrenciesQuery = () => {
    const res = useGet<PaginatedResponse<SaleCurrency>>(
        API.SETTINGS.CURRENCY.INDEX,
        { params: { page_size: SELECT_PAGE_SIZE } },
    )
    return { ...res, currencyList: getArray<SaleCurrency>(res.data?.results) }
}
