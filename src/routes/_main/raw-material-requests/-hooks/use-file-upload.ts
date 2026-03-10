import { API } from "@/lib/constants/api-endpoints"
import { BASE_URL } from "@/lib/constants/base-url"
import { CookieService } from "@/lib/utils/cookie-service"
import { useState } from "react"

type UploadResult = {
    id: number
    file: string
    created_at: string
}

export const useFileUpload = () => {
    const [isUploading, setIsUploading] = useState(false)

    const uploadFile = async (file: File): Promise<UploadResult> => {
        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append("file", file)

            const token = CookieService.getAccessToken()

            const res = await fetch(`${BASE_URL}${API.COMMON.UPLOADS.INDEX}/`, {
                method: "POST",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            })

            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                throw new Error(err?.detail || "Upload failed")
            }

            return await res.json()
        } finally {
            setIsUploading(false)
        }
    }

    return { uploadFile, isUploading }
}
