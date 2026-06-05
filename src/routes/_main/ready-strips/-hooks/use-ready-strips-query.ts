import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { PaginatedResponse } from "@/types/common"
import { useSearch } from "@tanstack/react-router"
import type { ReadyStrip } from "../-types"

export const useReadyStripsQuery = () => {
    const params = useSearch({ strict: false })
    const res = useGet<PaginatedResponse<ReadyStrip>>(
        API.MANUFACTURES.READY_STRIPS,
        { params: { page_size: 20, ...params } },
    )
    const readyStripList = getArray<ReadyStrip>(res.data?.results)
    const count = res.data?.count ?? 0
    return { ...res, readyStripList, count }
}
