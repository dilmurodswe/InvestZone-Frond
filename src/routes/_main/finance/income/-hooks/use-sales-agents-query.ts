import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { SalesAgent } from "../-types"

export const useSalesAgentsQuery = () => {
    const res = useGet<{ count: number; results: SalesAgent[] }>(
        API.ADMIN.USERS.INDEX,
    )
    const salesAgentList = getArray<SalesAgent>(res.data?.results)
    return { ...res, salesAgentList }
}
