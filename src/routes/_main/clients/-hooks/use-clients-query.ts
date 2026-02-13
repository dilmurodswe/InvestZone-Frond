import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { PaginatedResponse } from "@/types/common"
import { useSearch } from "@tanstack/react-router"
import type { Client } from "../-types"

export const useClientsQuery = () => {
    const params = useSearch({ strict: false })
    const res = useGet<PaginatedResponse<Client>>(API.CLIENT.USERS.INDEX, {
        params,
    })
    const clientList = getArray(res.data?.results)

    return { ...res, clientList }
}
