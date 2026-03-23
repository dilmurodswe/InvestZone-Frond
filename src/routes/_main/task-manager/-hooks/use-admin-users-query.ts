import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { Admin } from "@/routes/_main/admins/-types"
import type { PaginatedResponse } from "@/types/common"

export const useAdminUsersQuery = () => {
    const res = useGet<PaginatedResponse<Admin>>(API.ADMIN.USERS.INDEX, {
        params: { page_size: 100 },
    })
    const adminList = getArray(res.data?.results)

    return { ...res, adminList }
}
