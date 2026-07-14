import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { PaginatedResponse } from "@/types/common"
import { useSearch } from "@tanstack/react-router"
import type { StripBatch } from "../-types"

export const useStripBatchesQuery = () => {
    const params = useSearch({ strict: false }) as Record<string, unknown>
    const res = useGet<PaginatedResponse<StripBatch>>(
        API.MANUFACTURES.STRIP_BATCHES,
        { params: { page_size: 20, ...params } },
    )
    const batchList = getArray<StripBatch>(res.data?.results)
    const count = res.data?.count ?? 0
    return { ...res, batchList, count }
}
