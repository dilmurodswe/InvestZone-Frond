import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { PaginatedResponse } from "@/types/common"
import type { RawMaterial } from "../../settings/raw-materials/-types"

export const useRawMaterialsSelectQuery = () => {
    const res = useGet<PaginatedResponse<RawMaterial>>(
        API.EXTRA.RAW_MATERIALS.INDEX,
    )
    const rawMaterialOptions = getArray<RawMaterial>(res.data?.results)
    return { ...res, rawMaterialOptions }
}
