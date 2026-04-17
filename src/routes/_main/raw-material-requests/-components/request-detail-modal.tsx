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
    raw_material: {
        name: string
        extra_fields?: Record<string, string>
    }
    unit: string | null
    quantity: number | null
    shipped_quantity: number | null
    price: number | null
    line_total: number | null
    shipped_amount: number | null
    difference: number | null
}

type RowEdit = {
    quantity: string
    shipped_quantity: string
    price: string
    line_total: string
    shipped_amount: string
    difference: string
}

// Backenddan keladigan file ma'lumotlari uchun type
type RequestFileResponse = {
    id: number
    request_id: number
    request_file: {
        id: number
        name: string | null
        url: string
        created_at: string
    }
}

// UI uchun ishlatiladigan file type
type RequestFile = {
    id: number
    request_file_id: number
    file: string
    name: string
}

const TABLE_FIELDS: {
    key: keyof RowEdit
    label: string
    isNumber?: boolean
}[] = [
    { key: "quantity", label: "Quantity", isNumber: true },
    { key: "shipped_quantity", label: "Shipped qty", isNumber: true },
    { key: "price", label: "Price", isNumber: true },
    { key: "line_total", label: "Line total", isNumber: true },
    { key: "shipped_amount", label: "Shipped amount", isNumber: true },
    { key: "difference", label: "Difference", isNumber: true },
]

// ─── File helpers ─────────────────────────────────────────────────────────────

function getFileExt(url: string) {
    if (!url) return ""
    return url.split(".").pop()?.toLowerCase() ?? ""
}

function isImage(url: string) {
    if (!url) return false
    return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
        getFileExt(url),
    )
}

function FileIcon({ url, name }: { url: string; name: string }) {
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
            <p className="text-[10px] mt-0.5 text-center truncate w-36">
                {name || "Unnamed file"}
            </p>
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
    const [totalQuantity, setTotalQuantity] = useState(
        request.total_quantity ? String(request.total_quantity) : "",
    )
    const [shippedQuantity, setShippedQuantity] = useState(
        request.shipped_quantity ? String(request.shipped_quantity) : "",
    )
    const [specificationAmount, setSpecificationAmount] = useState(
        request.specification_amount ?
            String(request.specification_amount)
        :   "",
    )
    const [shippedAmount, setShippedAmount] = useState(
        request.shipped_amount ? String(request.shipped_amount) : "",
    )
    const [differenceUsd, setDifferenceUsd] = useState(
        request.difference_usd ? String(request.difference_usd) : "",
    )

    // ── Files ──
    // GET so‘rovini qayta yuklash uchun ishlatiladigan `key`
    // const [filesFetchKey] = useState(0)
    const {
        data: filesData,
        isLoading: filesLoading,
        refetch: refetchFiles,
    } = useGet<RequestFileResponse[]>(
        API.RAW_MATERIAL_REQUESTS.REQUEST_FILES.INDEX.replace(
            "{id}",
            String(request.id),
        ),
        {
            options: {
                staleTime: 0,
                refetchOnMount: "always",
            },
        },
    )

    // Backenddan kelgan ma'lumotlarni UI formatiga o'tkazish
    const fetchedFiles = getArray<RequestFileResponse>(filesData)
    const [localFiles, setLocalFiles] = useState<RequestFile[]>([])

    useEffect(() => {
        if (fetchedFiles.length > 0) {
            const formattedFiles: RequestFile[] = fetchedFiles.map((file) => ({
                id: file.request_file.id,
                request_file_id: file.id, // ← 23 — delete uchun
                file: file.request_file.url,
                name: file.request_file.name || `File ${file.request_file.id}`,
            }))
            setLocalFiles(formattedFiles)
        } else if (fetchedFiles.length === 0 && !filesLoading) {
            // Agar ro‘yxat bo‘sh bo‘lsa, localFiles ni tozalaymiz
            setLocalFiles([])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filesData])

    // ── Detail rows ──
    const { data: itemsData, isLoading: itemsLoading } = useGet<DetailRow[]>(
        API.RAW_MATERIAL_REQUESTS.ITEMS_ID.INDEX.replace(
            "{id}",
            String(request.id),
        ),
        {
            options: {
                staleTime: 0,
                refetchOnMount: "always",
            },
        },
    )
    const items = getArray<DetailRow>(itemsData)

    const [rowEdits, setRowEdits] = useState<Record<number, RowEdit>>({})

    useEffect(() => {
        if (items.length > 0) {
            const map: Record<number, RowEdit> = {}
            items.forEach((item) => {
                map[item.id] = {
                    quantity:
                        item.quantity != null ? String(item.quantity) : "",
                    shipped_quantity:
                        item.shipped_quantity != null ?
                            String(item.shipped_quantity)
                        :   "",
                    price: item.price != null ? String(item.price) : "",
                    line_total:
                        item.line_total != null ? String(item.line_total) : "",
                    shipped_amount:
                        item.shipped_amount != null ?
                            String(item.shipped_amount)
                        :   "",
                    difference:
                        item.difference != null ? String(item.difference) : "",
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
                    quantity: edit.quantity ? Number(edit.quantity) : null,
                    shipped_quantity:
                        edit.shipped_quantity ?
                            Number(edit.shipped_quantity)
                        :   null,
                    price: edit.price ? Number(edit.price) : null,
                    line_total:
                        edit.line_total ? Number(edit.line_total) : null,
                    shipped_amount:
                        edit.shipped_amount ?
                            Number(edit.shipped_amount)
                        :   null,
                    difference:
                        edit.difference ? Number(edit.difference) : null,
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
            // POST so‘rov yuborish
            post(
                API.RAW_MATERIAL_REQUESTS.REQUEST_FILES.POST,
                { request_id: request.id, file_id: uploaded.id },
                {
                    onSuccess: () => {
                        // Muvaffaqiyatli POST dan so‘ng, fayllar ro‘yxatini qayta yuklaymiz
                        refetchFiles().catch(() => {
                            toast.error("Failed to refresh file list")
                        })
                        toast.success("File uploaded successfully")
                    },
                    onError: (error) => {
                        console.error("File POST error:", error)
                        toast.error("Failed to upload file")
                    },
                },
            )
        } catch (error) {
            console.error("File upload error:", error)
            toast.error("File upload failed")
        }
    }

    // handleDeleteFile — request_file_id ishlatish:
    const handleDeleteFile = (requestFileId: number) => {
        const fileToDelete = localFiles.find(
            (f) => f.request_file_id === requestFileId,
        )
        if (!fileToDelete) return

        // Optimistic — darhol o'chirish
        setLocalFiles((prev) =>
            prev.filter((f) => f.request_file_id !== requestFileId),
        )

        remove(
            API.RAW_MATERIAL_REQUESTS.REQUEST_FILES.DELETE.replace(
                "{id}",
                String(requestFileId), // ← 23 ketadi
            ),
            {
                onSuccess: () => toast.success("File deleted successfully"),
                onError: () => {
                    setLocalFiles((prev) => [...prev, fileToDelete])
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
                total_quantity: totalQuantity ? Number(totalQuantity) : 0,
                shipped_quantity: shippedQuantity ? Number(shippedQuantity) : 0,
                specification_amount:
                    specificationAmount ? Number(specificationAmount) : 0,
                shipped_amount: shippedAmount ? Number(shippedAmount) : 0,
                difference_usd: differenceUsd ? Number(differenceUsd) : 0,
            },
            {
                onSuccess: () =>
                    invalidateByExactMatch([API.RAW_MATERIAL_ITEMS.INDEX]),
            },
        )
    }, [
        patch,
        request.id,
        request.status,
        tolerant,
        differance,
        invalidateByExactMatch,
        totalQuantity,
        shippedQuantity,
        specificationAmount,
        shippedAmount,
        differenceUsd,
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
                        {/* mavjud ikkitasi o'zgarmaydi, quyidagilar qo'shiladi */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">
                                Total quantity
                            </label>
                            <input
                                type="number"
                                className="border rounded px-3 py-2 text-sm w-48"
                                value={totalQuantity}
                                placeholder="—"
                                onChange={(e) =>
                                    setTotalQuantity(e.target.value)
                                }
                                onBlur={handleHeaderBlur}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">
                                Shipped quantity
                            </label>
                            <input
                                type="number"
                                className="border rounded px-3 py-2 text-sm w-48"
                                value={shippedQuantity}
                                placeholder="—"
                                onChange={(e) =>
                                    setShippedQuantity(e.target.value)
                                }
                                onBlur={handleHeaderBlur}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">
                                Specification amount
                            </label>
                            <input
                                type="number"
                                className="border rounded px-3 py-2 text-sm w-48"
                                value={specificationAmount}
                                placeholder="—"
                                onChange={(e) =>
                                    setSpecificationAmount(e.target.value)
                                }
                                onBlur={handleHeaderBlur}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">
                                Shipped amount
                            </label>
                            <input
                                type="number"
                                className="border rounded px-3 py-2 text-sm w-48"
                                value={shippedAmount}
                                placeholder="—"
                                onChange={(e) =>
                                    setShippedAmount(e.target.value)
                                }
                                onBlur={handleHeaderBlur}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">
                                Difference (USD)
                            </label>
                            <input
                                type="number"
                                className="border rounded px-3 py-2 text-sm w-48"
                                value={differenceUsd}
                                placeholder="—"
                                onChange={(e) =>
                                    setDifferenceUsd(e.target.value)
                                }
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
                                            <p className="text-[10px] mt-0.5 text-center truncate w-36">
                                                {rf.name}
                                            </p>
                                        </div>
                                    :   <FileIcon
                                            url={rf.file}
                                            name={rf.name}
                                        />
                                    }
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeleteFile(rf.request_file_id)
                                        }
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
                                            Unit
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
                                                                        item
                                                                            .raw_material
                                                                            .name,
                                                                    contractNumber:
                                                                        "",
                                                                },
                                                            )
                                                        }
                                                    >
                                                        {item.raw_material.name}
                                                    </button>
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-muted-foreground">
                                                    {item.unit ??
                                                        item.raw_material
                                                            .extra_fields?.[
                                                            "Eд. Изм"
                                                        ] ??
                                                        "—"}
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
