import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { Machine, ReadyStrip } from "../-types"

export const useMachinesQuery = () => {
    const res = useGet<Machine[]>(API.SETTINGS.MACHINE.INDEX)
    const machineOptions = getArray<Machine>(res.data).filter(
        (m) => m.is_active,
    )
    return { ...res, machineOptions }
}

export const useReadyStripsQuery = (params?: Record<string, string>) => {
    const res = useGet<ReadyStrip[]>(API.MANUFACTURES.READY_STRIPS, { params })
    const readyStripOptions = getArray<ReadyStrip>(res.data)
    return { ...res, readyStripOptions }
}
