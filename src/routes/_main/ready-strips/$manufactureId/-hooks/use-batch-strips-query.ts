import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { PaginatedResponse } from "@/types/common"
import { useSearch } from "@tanstack/react-router"
import type { ReadyStrip } from "../../-types"

export const useBatchStripsQuery = (
    manufactureId: string | number | undefined,
) => {
    const params = useSearch({ strict: false }) as Record<string, unknown>
    const res = useGet<PaginatedResponse<ReadyStrip>>(
        API.MANUFACTURES.READY_STRIPS,
        {
            params: { page_size: 20, manufacture: manufactureId, ...params },
            options: { enabled: !!manufactureId },
        },
    )
    const stripList = getArray<ReadyStrip>(res.data?.results)
    const count = res.data?.count ?? 0
    return { ...res, stripList, count }
}
