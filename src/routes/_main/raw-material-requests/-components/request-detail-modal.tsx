import { X, Upload, Trash2, Loader2 } from "lucide-react"
import { useRef, useState, useCallback } from "react"
import type { RawMaterialRequest } from "../-types"
import { useGet } from "@/hooks/react-query/use-get"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useFileUpload } from "../-hooks/use-file-upload"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import { toast } from "sonner"

// ─── Types ───────────────────────────────────────────────────────────────────

interface RequestDetailModalProps {
    request: RawMaterialRequest | null
    onClose: () => void
}

type DetailRow = {
    id: number
    material_name: string
    contract_number: string
    weight: number | null
    netto: number | null
    standard: string | null
    mark: string | null
    plank: string | null
    party_number: string | null
    roll: string | null
    wagon: number | null
}

type RowEdit = {
    weight: string
    netto: string
    standard: string
    mark: string
    plank: string
    party_number: string
    roll: string
    wagon: string
}

type RequestFile = {
    id: number
    file: string
}

const TABLE_FIELDS: { key: keyof RowEdit; label: string; isNumber?: boolean }[] =
    [
        { key: "weight", label: "Weight", isNumber: true },
        { key: "netto", label: "Netto", isNumber: true },
        { key: "standard", label: "Standard" },
        { key: "mark", label: "Mark" },
        { key: "plank", label: "Plank" },
        { key: "party_number", label: "Party number" },
        { key: "roll", label: "Roll" },
        { key: "wagon", label: "Wagon", isNumber: true },
    ]

// ─── Entry ───────────────────────────────────────────────────────────────────

export default function RequestDetailModal({
    request,
    onClose,
}: RequestDetailModalProps) {
    if (!request) return null
    return <DetailContent request={request} onClose={onClose} />
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

    // ── Header fields ──
    const [tolerant, setTolerant] = useState(
        request.tolerant ? String(request.tolerant) : "",
    )
    const [acceptedTon, setAcceptedTon] = useState(
        request.accepted_ton ? String(request.accepted_ton) : "",
    )
    const [differance, setDifferance] = useState(
        request.differance ? String(request.differance) : "",
    )

    // ── Files: GET /raw-material/request-files/{request_id}/ ──
    const { data: filesData, isLoading: filesLoading } = useGet<RequestFile[]>(
        API.RAW_MATERIAL_REQUESTS.REQUEST_FILES.INDEX.replace(
            "{id}",
            String(request.id),
        ),
    )
    const fetchedFiles = getArray<RequestFile>(filesData)

    // Local state — delete da darhol UI dan olib tashlanadi
    const [localFiles, setLocalFiles] = useState<RequestFile[]>([])
    if (fetchedFiles.length && localFiles.length === 0) {
        setLocalFiles(fetchedFiles)
    }

    // ── Detail rows: GET /raw-material/items/{requestId}/ ──
    const { data: itemsData, isLoading: itemsLoading } = useGet<DetailRow[]>(
        API.RAW_MATERIAL_REQUESTS.ITEMS_ID.INDEX.replace(
            "{id}",
            String(request.id),
        ),
    )
    const items = getArray<DetailRow>(itemsData)

    // ── Row edits: items kelganda to'g'ridan init ──
    // useEffect ichida setState ishlatmaslik uchun items ni derived state sifatida ishlatamiz
    const [rowEdits, setRowEdits] = useState<Record<number, RowEdit>>({})
    const [initializedKey, setInitializedKey] = useState<number | null>(null)

    // items birinchi marta kelganda va key o'zgarganda init
    if (items.length && initializedKey !== request.id) {
        const map: Record<number, RowEdit> = {}
        items.forEach((item) => {
            map[item.id] = {
                weight: item.weight != null ? String(item.weight) : "",
                netto: item.netto != null ? String(item.netto) : "",
                standard: item.standard ?? "",
                mark: item.mark ?? "",
                plank: item.plank ?? "",
                party_number: item.party_number ?? "",
                roll: item.roll ?? "",
                wagon: item.wagon != null ? String(item.wagon) : "",
            }
        })
        setRowEdits(map)
        setInitializedKey(request.id)
    }

    const updateRowEdit = (id: number, field: keyof RowEdit, value: string) => {
        setRowEdits((prev) => ({
            ...prev,
            [id]: { ...prev[id], [field]: value },
        }))
    }

    // ── Row auto-save onBlur: PATCH /raw-material/request-items/{id}/ ──
    const handleRowBlur = useCallback((id: number) => {
        const edit = rowEdits[id]
        if (!edit) return
        patch(
            API.RAW_MATERIAL_REQUESTS.REQUEST_ITEMS_ID.INDEX.replace(
                "{id}",
                String(id),
            ),
            {
                weight: edit.weight ? Number(edit.weight) : null,
                netto: edit.netto ? Number(edit.netto) : null,
                standard: edit.standard || null,
                mark: edit.mark || null,
                plank: edit.plank || null,
                party_number: edit.party_number || null,
                roll: edit.roll || null,
                wagon: edit.wagon ? Number(edit.wagon) : null,
            },
            {
                // onSuccess: () => toast.success("Saved"),
            },
        )
    }, [rowEdits, patch])

    // ── File upload: POST /raw-material/request-files/ ──
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
                        // toast.success("File uploaded")
                    },
                },
            )
        } catch {
            toast.error("File upload failed")
        }
    }

    // ── File delete: DELETE /raw-material/request-files/delete/{id}/ ──
    const handleDeleteFile = (fileId: number) => {
        // Darhol UI dan olib tashlaymiz
        setLocalFiles((prev) => prev.filter((f) => f.id !== fileId))
        remove(
            API.RAW_MATERIAL_REQUESTS.REQUEST_FILES.DELETE.replace(
                "{id}",
                String(fileId),
            ),
            {
                onError: () => {
                    // Xato bo'lsa qaytaramiz
                    setLocalFiles((prev) => [...prev, { id: fileId, file: "" }])
                    toast.error("Failed to remove file")
                },
            },
        )
    }

    // ── Header auto-save onBlur: PATCH /raw-material/{id}/patch/ ──
    const handleHeaderBlur = useCallback(() => {
        patch(
            API.RAW_MATERIAL_REQUESTS.ID.PATCH.replace("{id}", String(request.id)),
            {
                status: request.status,
                tolerant: tolerant ? Number(tolerant) : 0,
                accepted_ton: acceptedTon ? Number(acceptedTon) : 0,
                differance: differance ? Number(differance) : 0,
            },
            {
                onSuccess: () => {
                    invalidateByExactMatch([API.RAW_MATERIAL_ITEMS.INDEX])
                    // toast.success("Saved")
                },
            },
        )
    }, [patch, request.id, request.status, tolerant, acceptedTon, differance, invalidateByExactMatch])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-background rounded-xl shadow-2xl w-full max-w-full mx-4 max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-5">

                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-lg font-bold">
                            №{request.contract_number ?? "—"} —{" "}
                            {request.supplier ?? "—"}
                        </h2>
                        <span className="text-muted-foreground text-sm">|</span>
                        <span className="text-sm text-muted-foreground">
                            Requested{" "}
                            <span className="font-semibold text-foreground">
                                {request.quantity ?? 0} t
                            </span>
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {request.created_at
                                ? new Date(request.created_at).toLocaleDateString()
                                : "—"}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-muted"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── Tolerant / Accepted ton / Differance — onBlur da patch ── */}
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
                            Accepted tonn (t)
                        </label>
                        <input
                            type="number"
                            className="border rounded px-3 py-2 text-sm w-48"
                            value={acceptedTon}
                            placeholder="—"
                            onChange={(e) => setAcceptedTon(e.target.value)}
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
                        {/* Upload button — har doim ko'rinadi */}
                        {isUploading ? (
                            <div className="flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded-lg w-24 h-24 text-xs text-muted-foreground">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Uploading...</span>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded-lg w-24 h-24 text-xs text-muted-foreground hover:bg-muted transition-colors"
                            >
                                <Upload className="w-5 h-5" />
                                <span>Upload</span>
                            </button>
                        )}

                        {/* Mavjud fayllar */}
                        {filesLoading && (
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        )}
                        {localFiles.map((rf) => (
                            <div
                                key={rf.id}
                                className="relative w-24 h-24 rounded-lg overflow-hidden border group flex-shrink-0"
                            >
                                <img
                                    src={rf.file}
                                    alt="file"
                                    className="w-full h-full object-cover"
                                />
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
                    {itemsLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <table className="w-full text-sm">
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
                                            colSpan={10}
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
                                            {/* read-only */}
                                            <td className="px-3 py-2 text-sm whitespace-nowrap text-muted-foreground">
                                                {item.material_name}
                                            </td>
                                            <td className="px-3 py-2 text-sm whitespace-nowrap text-muted-foreground">
                                                {item.contract_number}
                                            </td>
                                            {/* editable — onBlur da patch */}
                                            {TABLE_FIELDS.map((f) => (
                                                <td key={f.key} className="px-2 py-1">
                                                    <input
                                                        type={f.isNumber ? "number" : "text"}
                                                        className="w-full min-w-[80px] border-0 border-b border-muted focus:border-primary outline-none bg-transparent text-sm py-1 transition-colors"
                                                        value={edit[f.key] ?? ""}
                                                        onChange={(e) =>
                                                            updateRowEdit(
                                                                item.id,
                                                                f.key,
                                                                e.target.value,
                                                            )
                                                        }
                                                        onBlur={() => handleRowBlur(item.id)}
                                                        placeholder="—"
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}