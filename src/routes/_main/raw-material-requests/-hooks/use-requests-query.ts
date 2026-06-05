import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { PaginatedResponse } from "@/types/common"
import { useSearch } from "@tanstack/react-router"
import type { RawMaterialRequest } from "../-types"

export const useRequestsQuery = () => {
    const params = useSearch({ strict: false })
    const res = useGet<PaginatedResponse<RawMaterialRequest>>(
        API.RAW_MATERIAL_ITEMS.INDEX,
        {
            params: { page_size: 20, ...params },
        },
    )
    const requestList = getArray<RawMaterialRequest>(res.data?.results)
    return { ...res, requestList }
}
