import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { PaginatedResponse } from "@/types/common"
import type { Machine, ReadyStrip } from "../-types"

export const useMachinesQuery = () => {
    const res = useGet<Machine[]>(API.SETTINGS.MACHINE.INDEX)
    const machineOptions = getArray<Machine>(res.data).filter(
        (m) => m.is_active,
    )
    return { ...res, machineOptions }
}

export const useReadyStripsQuery = (params?: Record<string, string>) => {
    const res = useGet<PaginatedResponse<ReadyStrip>>(
        API.MANUFACTURES.READY_STRIPS,
        // page_size katta — barcha sahifalardagi ready striplar bitta so'rovda kelsin
        { params: { page_size: "1000", status: "active", ...params } },
    )
    const readyStripOptions = getArray<ReadyStrip>(res.data?.results)
    const count = res.data?.count ?? 0
    return { ...res, readyStripOptions, count }
}
