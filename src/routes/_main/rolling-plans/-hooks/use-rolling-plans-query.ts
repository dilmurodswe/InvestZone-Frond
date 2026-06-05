import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { PaginatedResponse } from "@/types/common"
import { useSearch } from "@tanstack/react-router"
import type { RollingPlan } from "../-types"

export const useRollingPlansQuery = () => {
    const params = useSearch({ strict: false })
    const res = useGet<PaginatedResponse<RollingPlan>>(
        API.ROLLING_PLANS.INDEX,
        {
            params: { page_size: 20, ...params },
        },
    )
    const rollingPlanList = getArray<RollingPlan>(res.data?.results)
    const count = res.data?.count ?? 0
    return { ...res, rollingPlanList, count }
}
