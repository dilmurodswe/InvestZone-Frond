import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { PaginatedResponse } from "@/types/common"
import { useSearch } from "@tanstack/react-router"
import type { Demand } from "../-types"

export const useDemandsQuery = () => {
    const params = useSearch({ strict: false })
    const res = useGet<PaginatedResponse<Demand>>(API.DEMANDS.INDEX, {
        params: { page_size: 20, ...params },
    })
    const demandList = getArray<Demand>(res.data?.results)
    const count = res.data?.count ?? 0
    return { ...res, demandList, count }
}
