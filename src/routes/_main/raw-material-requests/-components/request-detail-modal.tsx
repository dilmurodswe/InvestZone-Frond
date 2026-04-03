import { useGet } from "@/hooks/react-query/use-get"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import { File, FileText, Loader2, Sheet, Trash2, Upload, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useFileUpload } from "../-hooks/use-file-upload"
import type { RawMaterialRequest } from "../-types"
import ItemDetailModal from "./item-detail-modal"

// ─── Types ────────────────────────────────────────────────────────────────────

interface RequestDetailModalProps {
    request: RawMaterialRequest | null
    onClose: () => void
}

type DetailRow = {
    id: number
    material_name: string
    contract_number: string
    ton: number | null
    weight: number | null
    netto: number | null
    plank: string | null
    reference_number: string | null
    price: number | null
    wagon: number | null
}

type RowEdit = {
    ton: string
    weight: string
    netto: string
    plank: string
    reference_number: string
    price: string
    wagon: string
}

type RequestFile = {
    id: number
    file: string
}

const TABLE_FIELDS: {
    key: keyof RowEdit
    label: string
    isNumber?: boolean
}[] = [
    { key: "ton", label: "Ton", isNumber: true },
    { key: "weight", label: "Weight", isNumber: true },
    { key: "netto", label: "Netto", isNumber: true },
    { key: "plank", label: "Plank" },
    { key: "reference_number", label: "Reference number" },
    { key: "price", label: "Price", isNumber: true },
    // { key: "wagon", label: "Wagon", isNumber: true },
]

// ─── File helpers ─────────────────────────────────────────────────────────────

function getFileExt(url: string) {
    return url.split(".").pop()?.toLowerCase() ?? ""
}

function isImage(url: string) {
    return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
        getFileExt(url),
    )
}

function FileIcon({ url }: { url: string }) {
    const ext = getFileExt(url)
    const icons: Record<
        string,
        { icon: React.ReactNode; color: string; label: string }
    > = {
        pdf: {
            icon: <FileText className="w-6 h-6" />,
            color: "text-red-500",
            label: "PDF",
        },
        doc: {
            icon: <FileText className="w-6 h-6" />,
            color: "text-blue-500",
            label: "DOC",
        },
        docx: {
            icon: <FileText className="w-6 h-6" />,
            color: "text-blue-500",
            label: "DOCX",
        },
        xls: {
            icon: <Sheet className="w-6 h-6" />,
            color: "text-green-500",
            label: "XLS",
        },
        xlsx: {
            icon: <Sheet className="w-6 h-6" />,
            color: "text-green-500",
            label: "XLSX",
        },
    }
    const cfg = icons[ext] ?? {
        icon: <File className="w-6 h-6" />,
        color: "text-muted-foreground",
        label: ext.toUpperCase(),
    }

    return (
        <div>
            <a
                href={url}
                download
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1 w-36 h-16 rounded-lg border bg-muted/30 hover:bg-muted transition-colors"
            >
                <span className={cfg.color}>{cfg.icon}</span>
                <span className="text-[10px] font-semibold text-muted-foreground">
                    {cfg.label}
                </span>
            </a>
            <p className="text-[10px] mt-0.5">{url.split("/").pop()}</p>
        </div>
    )
}

// ─── Entry ────────────────────────────────────────────────────────────────────

export default function RequestDetailModal({
    request,
    onClose,
}: RequestDetailModalProps) {
    if (!request) return null
    return (
        <DetailContent key={request.id} request={request} onClose={onClose} />
    )
}

// ─── Content ─────────────────────────────────────────────────────────────────

function DetailContent({
    request,
    onClose,
}: {
    request: RawMaterialRequest
    onClose: () => void
}) {
    const { patch, post, remove } = useRequest()
    const { invalidateByExactMatch } = useRevalidate()
    const { uploadFile, isUploading } = useFileUpload()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [itemDetailTarget, setItemDetailTarget] = useState<{
        rowItemId: number
        materialName: string
        contractNumber: string
    } | null>(null)

    const [tolerant, setTolerant] = useState(
        request.tolerant ? String(request.tolerant) : "",
    )
    const [differance, setDifferance] = useState(
        request.differance ? String(request.differance) : "",
    )

    // ── Files ──
    const { data: filesData, isLoading: filesLoading } = useGet<RequestFile[]>(
        API.RAW_MATERIAL_REQUESTS.REQUEST_FILES.INDEX.replace(
            "{id}",
            String(request.id),
        ),
    )
    const fetchedFiles = getArray<RequestFile>(filesData)

    const [localFiles, setLocalFiles] = useState<RequestFile[]>([])
    useEffect(() => {
        if (fetchedFiles.length > 0) {
            setLocalFiles(fetchedFiles)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filesData])

    // ── Detail rows ──
    const { data: itemsData, isLoading: itemsLoading } = useGet<DetailRow[]>(
        API.RAW_MATERIAL_REQUESTS.ITEMS_ID.INDEX.replace(
            "{id}",
            String(request.id),
        ),
    )
    const items = getArray<DetailRow>(itemsData)

    const [rowEdits, setRowEdits] = useState<Record<number, RowEdit>>({})

    useEffect(() => {
        if (items.length > 0) {
            const map: Record<number, RowEdit> = {}
            items.forEach((item) => {
                map[item.id] = {
                    ton: item.ton != null ? String(item.ton) : "",
                    weight: item.weight != null ? String(item.weight) : "",
                    netto: item.netto != null ? String(item.netto) : "",
                    plank: item.plank ?? "",
                    reference_number: item.reference_number ?? "",
                    price: item.price != null ? String(item.price) : "",
                    wagon: item.wagon != null ? String(item.wagon) : "",
                }
            })
            setRowEdits(map)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemsData])

    const updateRowEdit = (id: number, field: keyof RowEdit, value: string) => {
        setRowEdits((prev) => ({
            ...prev,
            [id]: { ...prev[id], [field]: value },
        }))
    }

    const handleRowBlur = useCallback(
        (id: number) => {
            const edit = rowEdits[id]
            if (!edit) return
            patch(
                API.RAW_MATERIAL_REQUESTS.REQUEST_ITEMS_ID.INDEX.replace(
                    "{id}",
                    String(id),
                ),
                {
                    ton: edit.ton ? Number(edit.ton) : null,
                    weight: edit.weight ? Number(edit.weight) : null,
                    netto: edit.netto ? Number(edit.netto) : null,
                    plank: edit.plank || null,
                    reference_number: edit.reference_number || null,
                    price: edit.price ? Number(edit.price) : null,
                    wagon: edit.wagon ? Number(edit.wagon) : null,
                },
                {},
            )
        },
        [rowEdits, patch],
    )

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        e.target.value = ""
        try {
            const uploaded = await uploadFile(file)
            post(
                API.RAW_MATERIAL_REQUESTS.REQUEST_FILES.POST,
                { request_id: request.id, file: uploaded.file },
                {
                    onSuccess: (data: RequestFile) => {
                        setLocalFiles((prev) => [...prev, data])
                    },
                },
            )
        } catch {
            toast.error("File upload failed")
        }
    }

    const handleDeleteFile = (fileId: number) => {
        setLocalFiles((prev) => prev.filter((f) => f.id !== fileId))
        remove(
            API.RAW_MATERIAL_REQUESTS.REQUEST_FILES.DELETE.replace(
                "{id}",
                String(fileId),
            ),
            {
                onError: () => {
                    setLocalFiles((prev) => [...prev, { id: fileId, file: "" }])
                    toast.error("Failed to remove file")
                },
            },
        )
    }

    const handleHeaderBlur = useCallback(() => {
        patch(
            API.RAW_MATERIAL_REQUESTS.ID.PATCH.replace(
                "{id}",
                String(request.id),
            ),
            {
                status: request.status,
                tolerant: tolerant ? Number(tolerant) : 0,
                differance: differance ? Number(differance) : 0,
            },
            {
                onSuccess: () => {
                    invalidateByExactMatch([API.RAW_MATERIAL_ITEMS.INDEX])
                },
            },
        )
    }, [
        patch,
        request.id,
        request.status,
        tolerant,
        differance,
        invalidateByExactMatch,
    ])

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-background rounded-xl shadow-2xl w-full max-w-full mx-4 max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-5">
                    {/* ── Header ── */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-lg font-bold">
                                №{request.contract_number ?? "—"} —{" "}
                                {request.supplier ?? "—"}
                            </h2>
                            <span className="text-muted-foreground text-sm">
                                |
                            </span>
                            <span className="text-sm text-muted-foreground">
                                Requested{" "}
                                <span className="font-semibold text-foreground">
                                    {request.quantity ?? 0} t
                                </span>
                            </span>
                            <span className="text-sm text-muted-foreground">
                                {request.created_at ?
                                    new Date(
                                        request.created_at,
                                    ).toLocaleDateString()
                                :   "—"}
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 rounded hover:bg-muted"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* ── Tolerant / Differance ── */}
                    <div className="flex gap-4 flex-wrap items-end">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">
                                Tolerants (%)
                            </label>
                            <input
                                type="number"
                                className="border rounded px-3 py-2 text-sm w-48"
                                value={tolerant}
                                placeholder="—"
                                onChange={(e) => setTolerant(e.target.value)}
                                onBlur={handleHeaderBlur}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">
                                Difference ($)
                            </label>
                            <input
                                type="number"
                                className="border rounded px-3 py-2 text-sm w-48"
                                value={differance}
                                placeholder="—"
                                onChange={(e) => setDifferance(e.target.value)}
                                onBlur={handleHeaderBlur}
                            />
                        </div>
                    </div>

                    {/* ── File upload ── */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Files</span>
                            <span className="text-xs text-muted-foreground">
                                *Please keep your file size below 30 MB
                            </span>
                        </div>
                        <div className="flex gap-3 flex-wrap items-center">
                            {isUploading ?
                                <div className="flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded-lg w-24 h-24 text-xs text-muted-foreground">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Uploading...</span>
                                </div>
                            :   <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded-lg w-24 h-24 text-xs text-muted-foreground hover:bg-muted transition-colors"
                                >
                                    <Upload className="w-5 h-5" />
                                    <span>Upload</span>
                                </button>
                            }
                            {filesLoading && (
                                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                            )}
                            {localFiles.map((rf) => (
                                <div
                                    key={rf.id}
                                    className="relative w-36 h-24 rounded-lg overflow-hidden group flex-shrink-0"
                                >
                                    {isImage(rf.file) ?
                                        <div>
                                            <img
                                                src={rf.file}
                                                alt="file"
                                                className="w-36 h-16 object-cover"
                                            />
                                            <p className="text-[10px] mt-0.5">
                                                {rf.file.split("/").pop()}
                                            </p>
                                        </div>
                                    :   <FileIcon url={rf.file} />}
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteFile(rf.id)}
                                        className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                    {/* ── Detail table ── */}
                    <div className="overflow-x-auto rounded-md border">
                        {itemsLoading ?
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        :   <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                            Raw material name
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                            Contract number
                                        </th>
                                        {TABLE_FIELDS.map((f) => (
                                            <th
                                                key={f.key}
                                                className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap"
                                            >
                                                {f.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={
                                                    2 + TABLE_FIELDS.length
                                                }
                                                className="text-center py-6 text-muted-foreground text-sm"
                                            >
                                                No data
                                            </td>
                                        </tr>
                                    )}
                                    {items.map((item) => {
                                        const edit = rowEdits[item.id] ?? {}
                                        return (
                                            <tr
                                                key={item.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="px-3 py-2 whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        className="text-sm font-medium text-left hover:text-primary hover:underline transition-colors"
                                                        onClick={() =>
                                                            setItemDetailTarget(
                                                                {
                                                                    rowItemId:
                                                                        item.id,
                                                                    materialName:
                                                                        item.material_name,
                                                                    contractNumber:
                                                                        item.contract_number,
                                                                },
                                                            )
                                                        }
                                                    >
                                                        {item.material_name}
                                                    </button>
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        className="text-sm text-left hover:text-primary hover:underline transition-colors text-muted-foreground"
                                                        onClick={() =>
                                                            setItemDetailTarget(
                                                                {
                                                                    rowItemId:
                                                                        item.id,
                                                                    materialName:
                                                                        item.material_name,
                                                                    contractNumber:
                                                                        item.contract_number,
                                                                },
                                                            )
                                                        }
                                                    >
                                                        {item.contract_number}
                                                    </button>
                                                </td>
                                                {TABLE_FIELDS.map((f) => (
                                                    <td
                                                        key={f.key}
                                                        className="px-2 py-1"
                                                    >
                                                        <input
                                                            type={
                                                                f.isNumber ?
                                                                    "number"
                                                                :   "text"
                                                            }
                                                            className="w-full min-w-[80px] border-0 border-b border-muted focus:border-primary outline-none bg-transparent text-sm py-1 transition-colors"
                                                            value={
                                                                edit[f.key] ??
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                updateRowEdit(
                                                                    item.id,
                                                                    f.key,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            onBlur={() =>
                                                                handleRowBlur(
                                                                    item.id,
                                                                )
                                                            }
                                                            placeholder="—"
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        }
                    </div>
                </div>
            </div>

            {itemDetailTarget && (
                <ItemDetailModal
                    rowItemId={itemDetailTarget.rowItemId}
                    materialName={itemDetailTarget.materialName}
                    contractNumber={itemDetailTarget.contractNumber}
                    onClose={() => setItemDetailTarget(null)}
                />
            )}
        </>
    )
}
