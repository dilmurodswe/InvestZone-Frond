import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { RawMaterial } from "@/routes/_main/extra/raw-materials/-types"
import type { PaginatedResponse } from "@/types/common"

export const useRawMaterialsSelectQuery = () => {
    const res = useGet<PaginatedResponse<RawMaterial>>(
        API.EXTRA.RAW_MATERIALS.INDEX,
    )
    const rawMaterialOptions = getArray<RawMaterial>(res.data?.results)
    return { ...res, rawMaterialOptions }
}
