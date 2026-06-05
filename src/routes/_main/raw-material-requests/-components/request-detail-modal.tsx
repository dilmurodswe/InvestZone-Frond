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
    price: string
    present: string
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

    // ── Files ──
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

    const fetchedFiles = getArray<RequestFileResponse>(filesData)
    const [localFiles, setLocalFiles] = useState<RequestFile[]>([])

    useEffect(() => {
        if (fetchedFiles.length > 0) {
            const formattedFiles: RequestFile[] = fetchedFiles.map((file) => ({
                id: file.request_file.id,
                request_file_id: file.id,
                file: file.request_file.url,
                name: file.request_file.name || `File ${file.request_file.id}`,
            }))
            setLocalFiles(formattedFiles)
        } else if (fetchedFiles.length === 0 && !filesLoading) {
            setLocalFiles([])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filesData])

    // ── Detail rows ──
    const {
        data: itemsData,
        isLoading: itemsLoading,
        refetch: refetchItems,
    } = useGet<DetailRow[]>(
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

    // Only price and present are editable
    const [rowEdits, setRowEdits] = useState<Record<number, RowEdit>>({})

    useEffect(() => {
        if (items.length > 0) {
            const map: Record<number, RowEdit> = {}
            items.forEach((item) => {
                map[item.id] = {
                    price: item.price != null ? String(item.price) : "",
                    present: "",
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

    // Compute derived values for a row
    const getDerivedValues = (item: DetailRow, edit: RowEdit) => {
        const price = edit?.price ? Number(edit.price) : (item.price ?? 0)
        const quantity = item.quantity ?? 0
        const shippedQty = item.shipped_quantity ?? 0

        const lineTotal = quantity * price
        const shippedAmount = shippedQty * price
        const difference = lineTotal - shippedAmount
        const presentRaw =
            lineTotal !== 0 ? (shippedAmount / lineTotal) * 100 : 0

        // Agar shipped 0 bo'lsa, 100 dan ayirmasdan 0 qoldiramiz
        const presentNumber = presentRaw === 0 ? 0 : 100 - presentRaw
        const present = presentNumber.toFixed(3)

        return {
            price,
            lineTotal,
            shippedAmount,
            difference,
            present,
            presentNumber,
        }
    }

    const handleRowBlur = useCallback(
        (id: number, item: DetailRow) => {
            const edit = rowEdits[id]
            if (!edit) return
            const { price } = getDerivedValues(item, edit)
            patch(
                API.RAW_MATERIAL_REQUESTS.REQUEST_ITEMS_ID.INDEX.replace(
                    "{id}",
                    String(id),
                ),
                {
                    price: price || null,
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
                { request_id: request.id, file_id: uploaded.id },
                {
                    onSuccess: () => {
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

    const handleDeleteFile = (requestFileId: number) => {
        const fileToDelete = localFiles.find(
            (f) => f.request_file_id === requestFileId,
        )
        if (!fileToDelete) return

        setLocalFiles((prev) =>
            prev.filter((f) => f.request_file_id !== requestFileId),
        )

        remove(
            API.RAW_MATERIAL_REQUESTS.REQUEST_FILES.DELETE.replace(
                "{id}",
                String(requestFileId),
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

    // Header fields are now read-only (GET only, no patch)
    const headerFields = [
        { label: "Tolerants (%)", value: request.tolerant },
        { label: "Total quantity", value: request.total_quantity },
        { label: "Shipped quantity", value: request.shipped_quantity },
        { label: "Specification amount", value: request.specification_amount },
        { label: "Shipped amount", value: request.shipped_amount },
        {
            label: "Difference (USD)",
            value: request.difference_usd + "$ - " + request.present + "%",
        },
    ]

    const handleItemModalClose = useCallback(() => {
        setItemDetailTarget(null)
        // Refetch items table so shipped_amount updates are reflected
        refetchItems().catch(() => {
            toast.error("Failed to refresh items")
        })
        // Also invalidate the main list
        invalidateByExactMatch([API.RAW_MATERIAL_ITEMS.INDEX])
    }, [refetchItems, invalidateByExactMatch])

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

                    {/* ── Header fields (read-only) ── */}
                    <div className="flex gap-4 flex-wrap items-end">
                        {headerFields.map((field) => (
                            <div
                                key={field.label}
                                className="flex flex-col gap-1"
                            >
                                <label className="text-xs text-muted-foreground">
                                    {field.label}
                                </label>
                                <div className="border rounded px-3 py-2 text-sm w-48 bg-muted/30 text-foreground min-h-[38px]">
                                    {field.value != null ? field.value : "—"}
                                </div>
                            </div>
                        ))}
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
                                            Quantity
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                            Shipped qty
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                            Price
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                            Line total
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                            Shipped amount
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                            Difference
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                            Present (%)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="text-center py-6 text-muted-foreground text-sm"
                                            >
                                                No data
                                            </td>
                                        </tr>
                                    )}
                                    {items.map((item) => {
                                        const edit = rowEdits[item.id] ?? {
                                            price: "",
                                            present: "",
                                        }
                                        const derived = getDerivedValues(
                                            item,
                                            edit,
                                        )

                                        return (
                                            <tr
                                                key={item.id}
                                                className="border-b last:border-0"
                                            >
                                                {/* Raw material name */}
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

                                                {/* Quantity — read-only */}
                                                <td className="px-3 py-2 text-sm text-muted-foreground whitespace-nowrap">
                                                    {item.quantity ?? "—"}
                                                </td>

                                                {/* Shipped qty — read-only */}
                                                <td className="px-3 py-2 text-sm text-muted-foreground whitespace-nowrap">
                                                    {item.shipped_quantity ??
                                                        "—"}
                                                </td>

                                                {/* Price — editable */}
                                                <td className="px-2 py-1">
                                                    <input
                                                        type="number"
                                                        className="w-full min-w-[80px] border-0 border-b border-muted focus:border-primary outline-none bg-transparent text-sm py-1 transition-colors"
                                                        value={edit.price}
                                                        onChange={(e) =>
                                                            updateRowEdit(
                                                                item.id,
                                                                "price",
                                                                e.target.value,
                                                            )
                                                        }
                                                        onBlur={() =>
                                                            handleRowBlur(
                                                                item.id,
                                                                item,
                                                            )
                                                        }
                                                        placeholder="—"
                                                    />
                                                </td>

                                                {/* Line total — computed, read-only */}
                                                <td className="px-3 py-2 text-sm text-muted-foreground whitespace-nowrap">
                                                    {edit.price ?
                                                        derived.lineTotal.toLocaleString()
                                                    :   "—"}
                                                </td>

                                                {/* Shipped amount — computed, read-only */}
                                                <td className="px-3 py-2 text-sm text-muted-foreground whitespace-nowrap">
                                                    {edit.price ?
                                                        derived.shippedAmount.toLocaleString()
                                                    :   "—"}
                                                </td>

                                                {/* Difference — computed, read-only */}
                                                <td className="px-3 py-2 text-sm whitespace-nowrap">
                                                    {edit.price ?
                                                        <span
                                                            className="font-semibold"
                                                            style={{
                                                                color:
                                                                    (
                                                                        derived.difference >=
                                                                        0
                                                                    ) ?
                                                                        "#16C647"
                                                                    :   "#E73C50",
                                                            }}
                                                        >
                                                            {(
                                                                derived.difference >=
                                                                0
                                                            ) ?
                                                                "+"
                                                            :   ""}
                                                            {derived.difference.toLocaleString()}
                                                        </span>
                                                    :   "—"}
                                                </td>

                                                {/* Present (%) — computed, read-only */}
                                                <td className="px-3 py-2 text-sm whitespace-nowrap">
                                                    {edit.price ?
                                                        <span
                                                            className="font-semibold"
                                                            style={{
                                                                color:
                                                                    (
                                                                        derived.presentNumber >=
                                                                        0
                                                                    ) ?
                                                                        "#16C647"
                                                                    :   "#E73C50",
                                                            }}
                                                        >
                                                            {(
                                                                derived.presentNumber >=
                                                                0
                                                            ) ?
                                                                "+"
                                                            :   ""}
                                                            {derived.present}%
                                                        </span>
                                                    :   "—"}
                                                </td>
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
                    onClose={handleItemModalClose}
                />
            )}
        </>
    )
}
