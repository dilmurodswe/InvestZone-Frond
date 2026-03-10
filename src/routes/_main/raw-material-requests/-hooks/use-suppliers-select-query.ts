import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { PaginatedResponse } from "@/types/common"

type SupplierOption = {
    id: number
    company_name: string
}

export const useSuppliersSelectQuery = () => {
    const res = useGet<PaginatedResponse<SupplierOption>>(
        API.SUPPLIER.USERS.INDEX,
    )
    const supplierOptions = getArray<SupplierOption>(res.data?.results)
    return { ...res, supplierOptions }
}
