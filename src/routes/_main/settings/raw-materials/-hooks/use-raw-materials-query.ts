import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { PaginatedResponse } from "@/types/common"
import { useSearch } from "@tanstack/react-router"
import type { RawMaterial } from "../-types"

export const useRawMaterialsQuery = () => {
    const params = useSearch({ strict: false })
    const res = useGet<PaginatedResponse<RawMaterial>>(
        API.EXTRA.RAW_MATERIALS.INDEX,
        {
            params: { page_size: 20, ...params },
        },
    )
    const rawMaterialList = getArray(res.data?.results)

    return { ...res, rawMaterialList }
}
