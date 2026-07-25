/**
 * Hujjatga biriktirilgan fayllar (MoySklad'dagi «Файлы» bloki kabi).
 *
 * Sxema xomashyo so'rovlaridagi bilan bir xil: fayl avval `common/uploads` ga
 * yuklanadi, keyin qaytgan `id` hujjatga bog'lanadi. Endpoint hali yo'q bo'lsa
 * blok shunchaki bo'sh ko'rinadi — xatolik chiqarmaydi.
 */

import { Button } from "@/components/ui/button"
import { useGet } from "@/hooks/react-query/use-get"
import { useRequest } from "@/hooks/react-query/use-request"
import { useFileUpload } from "@/hooks/use-file-upload"
import { getArray } from "@/lib/utils/get-array"
import { cn } from "@/lib/utils/shadcn"
import { File, FileSpreadsheet, FileText, Image, Loader2, Trash2, Upload } from "lucide-react"
import { useRef } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

export type UploadedFile = {
    id: number
    name: string | null
    url: string
}

/**
 * Bog'lash jadvalining bitta qatori.
 *
 * Ichki obyekt kaliti backendda hujjat nomi bilan atalishi mumkin
 * (`request_file`, `order_file`…), shuning uchun aniq nom talab qilinmaydi.
 */
export type DocumentFileLink = {
    /** Bog'lanish id'si — o'chirishda shu ishlatiladi. */
    id: number
} & Record<string, unknown>

function fileOf(link: DocumentFileLink): UploadedFile | null {
    const nested = Object.values(link).find(
        (value): value is UploadedFile =>
            typeof value === "object" &&
            value !== null &&
            typeof (value as UploadedFile).url === "string",
    )
    return nested ?? null
}

type Props = {
    /** Ro'yxat manzili, `{id}` o'rniga hujjat id'si qo'yilgan holda. */
    listUrl: string
    /** Bog'lash manzili (POST). */
    attachUrl: string
    /** Uzish manzili, `{id}` o'rniga bog'lanish id'si qo'yiladi. */
    detachUrl: string
    /** POST tanasidagi hujjat kaliti, masalan `order_id`. */
    documentKey: string
    documentId: number
}

const EXTENSION_ICONS: { match: RegExp; icon: typeof File; color: string }[] = [
    { match: /\.(png|jpe?g|webp|gif|svg)$/i, icon: Image, color: "text-violet-600" },
    { match: /\.(xlsx?|csv)$/i, icon: FileSpreadsheet, color: "text-emerald-600" },
    { match: /\.(pdf|docx?|txt)$/i, icon: FileText, color: "text-red-600" },
]

function iconFor(url: string) {
    return (
        EXTENSION_ICONS.find((entry) => entry.match.test(url)) ?? {
            icon: File,
            color: "text-muted-foreground",
        }
    )
}

export default function DocumentFiles({
    listUrl,
    attachUrl,
    detachUrl,
    documentKey,
    documentId,
}: Props) {
    const { t } = useTranslation()
    const { post, remove } = useRequest()
    const { uploadFile, isUploading } = useFileUpload()
    const inputRef = useRef<HTMLInputElement>(null)

    const { data, refetch } = useGet<DocumentFileLink[]>(listUrl, {
        options: { staleTime: 0, refetchOnMount: "always", retry: false },
    })
    const files = getArray<DocumentFileLink>(data)

    const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
        event.target.value = ""
        try {
            const uploaded = await uploadFile(file)
            post(
                attachUrl,
                { [documentKey]: documentId, file_id: uploaded.id },
                {
                    onSuccess: () => {
                        void refetch()
                        toast.success(t("table.fileUploaded"))
                    },
                    onError: () => toast.error(t("table.fileUploadFailed")),
                },
            )
        } catch {
            toast.error(t("table.fileUploadFailed"))
        }
    }

    const handleRemove = (linkId: number) => {
        remove(detachUrl.replace("{id}", String(linkId)), {
            onSuccess: () => {
                void refetch()
                toast.success(t("table.fileDeleted"))
            },
        })
    }

    return (
        <div className="flex flex-col gap-3 p-4">
            <div className="flex flex-wrap gap-4">
                {files.map((link) => {
                    const file = fileOf(link)
                    const { icon: Icon, color } = iconFor(file?.url ?? "")
                    return (
                        <div key={link.id} className="relative w-36">
                            <a
                                href={file?.url}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center gap-2 h-16 rounded-lg border bg-muted/30 hover:bg-muted transition-colors"
                            >
                                <Icon className={cn("w-6 h-6", color)} />
                            </a>
                            <p className="mt-1 text-[11px] text-center truncate">
                                {file?.name || `#${file?.id ?? link.id}`}
                            </p>
                            <button
                                type="button"
                                onClick={() => handleRemove(link.id)}
                                className="absolute -top-2 -right-2 p-1 rounded-full bg-background border text-red-500 hover:bg-muted"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )
                })}

                {!files.length && (
                    <p className="text-sm text-muted-foreground self-center">
                        {t("common.noData")}
                    </p>
                )}
            </div>

            <div>
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    onChange={handleChange}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => inputRef.current?.click()}
                >
                    {isUploading ?
                        <Loader2 className="w-4 h-4 animate-spin" />
                    :   <Upload className="w-4 h-4" />}
                    {t("table.addFile")}
                </Button>
            </div>
        </div>
    )
}
