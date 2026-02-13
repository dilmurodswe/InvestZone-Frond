import { useGet } from "@/hooks/react-query/use-get"
import { useRequest } from "@/hooks/react-query/use-request"
import { downloadExcel } from "@/lib/utils/download-excel"
import { onError } from "@/lib/utils/on-error"
import { Download } from "lucide-react"
import { Button } from "../ui/button"

interface Props {
    url: string
    name: string
    method?: "get" | "post"
    params?: Record<string, unknown>
    defaultName?: string
}

const DownloadAsExcel = ({
    url,
    name,
    method = "get",
    params,
    defaultName,
}: Props) => {
    const { refetch, isFetching } = useGet<Blob>(url, {
        options: { enabled: false },
        config: { responseType: "blob" },
        params,
    })
    const { post, isPending } = useRequest({
        config: {
            responseType: "blob",
            params,
        },
    })

    const trigger = async () => {
        if (method === "get") {
            const { data, isSuccess, isError, error } = await refetch()
            if (isSuccess) {
                downloadExcel({ data, name })
            }
            if (isError) {
                onError(error)
            }
        }
        if (method === "post") {
            post(url, undefined, {
                onSuccess: (res: Blob) => {
                    downloadExcel({ data: res, name, defaultName })
                },
                onError,
            })
        }
    }

    return (
        <Button
            variant="outline"
            icon={<Download width={16} />}
            isLoading={isFetching || isPending}
            onClick={trigger}
        >
            {/* Yuklab olish */}
        </Button>
    )
}

export default DownloadAsExcel
