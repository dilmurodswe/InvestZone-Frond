import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"

type ExtraFieldValue = {
    table_name: string
    table_options: string[]
}

export const useExtraFieldValues = () => {
    const res = useGet<ExtraFieldValue[]>(
        API.EXTRA.RAW_MATERIALS.EXTRA_FIELD_VALUES, // shu endpointni API konstantaga qo'shish kerak
    )
    return { ...res, extraFieldValues: res.data ?? [] }
}
