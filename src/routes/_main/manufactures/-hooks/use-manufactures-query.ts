import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { PaginatedResponse } from "@/types/common"
import { useSearch } from "@tanstack/react-router"
import type { Manufacture } from "../-types"

export const useManufacturesQuery = () => {
    const params = useSearch({ strict: false })
    const res = useGet<PaginatedResponse<Manufacture>>(API.MANUFACTURES.INDEX, {
        params,
    })
    const manufactureList = getArray<Manufacture>(res.data?.results)
    const count = res.data?.count ?? 0
    return { ...res, manufactureList, count }
}
