import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { PaginatedResponse } from "@/types/common"
import { useSearch } from "@tanstack/react-router"
import type { Admin } from "../-types"

export const useAdminsQuery = () => {
    const params = useSearch({ strict: false })
    const res = useGet<PaginatedResponse<Admin>>(API.ADMIN.USERS.INDEX, {
        params,
    })
    const adminList = getArray(res.data?.results)

    return { ...res, adminList }
}
