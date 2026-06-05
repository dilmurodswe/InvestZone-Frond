import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { PaginatedResponse } from "@/types/common"
import { useSearch } from "@tanstack/react-router"
import type { Supplier } from "../-types"

export const useSuppliersQuery = () => {
    const params = useSearch({ strict: false })
    const res = useGet<PaginatedResponse<Supplier>>(API.SUPPLIER.USERS.INDEX, {
        params: { page_size: 20, ...params },
    })
    const supplierList = getArray(res.data?.results)

    return { ...res, supplierList }
}
