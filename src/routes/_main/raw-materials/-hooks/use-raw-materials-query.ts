import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { PaginatedResponse } from "@/types/common"
import { useSearch } from "@tanstack/react-router"
import type { RawMaterial } from "../-types"

export const useRawMaterialsQuery = () => {
    const params = useSearch({ strict: false }) as Record<string, unknown>
    const res = useGet<PaginatedResponse<RawMaterial>>(
        API.RAW_MATERIALS.INDEX,
        { params: { page_size: 20, status: "received", ...params } },
    )
    const rawMaterialList = getArray<RawMaterial>(res.data?.results)
    const count = res.data?.count ?? 0
    return { ...res, rawMaterialList, count }
}
