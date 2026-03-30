import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { Client } from "../-types"

export const useClientsQuery = () => {
    const res = useGet<{ count: number; results: Client[] }>(
        API.CLIENT.USERS.INDEX,
    )
    const clientList = getArray<Client>(res.data?.results)
    return { ...res, clientList }
}
