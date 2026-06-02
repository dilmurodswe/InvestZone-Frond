import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import { CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import {
    File,
    FileText,
    Loader2,
    Plus,
    Sheet,
    Trash2,
    Upload,
} from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { useFileUpload } from "../-hooks/use-file-upload"
import { useSuppliersSelectQuery } from "../-hooks/use-suppliers-select-query"
import PaginatedRawMaterialSelect from "./paginated-raw-material-select"

export default function NewRequestModal() {
    return (
        <Modal modalKey="new-request" title={null}>
            <NewRequestForm />
        </Modal>
    )
}

type RowItem = {
    id: number
    raw_material: string
    ton: string
}

type UploadedFile = {
    id: number
    url: string
    name: string
}

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

function NewRequestForm() {
    const { closeModal } = useModal("new-request")
    const { invalidateByPatternMatch } = useRevalidate()
    const { post, isPending } = useRequest()
    const { supplierOptions } = useSuppliersSelectQuery()
    const { uploadFile, isUploading } = useFileUpload()

    const [rows, setRows] = useState<RowItem[]>([
        { id: 1, raw_material: "", ton: "" },
    ])
    const [supplier, setSupplier] = useState("")
    const [contractNumber, setContractNumber] = useState("") // Added contract number state
    const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const addRow = () => {
        setRows((prev) => [
            ...prev,
            { id: Date.now(), raw_material: "", ton: "" },
        ])
    }

    const removeRow = (id: number) => {
        setRows((prev) => prev.filter((r) => r.id !== id))
    }

    const updateRow = (
        id: number,
        field: keyof Omit<RowItem, "id">,
        value: string,
    ) => {
        setRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
        )
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        e.target.value = ""
        try {
            const result = await uploadFile(file)
            setUploadedFile({
                id: result.id,
                url: result.url, // file → url
                name: file.name,
            })
        } catch {
            toast.error("File upload failed")
        }
    }

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        const file = e.dataTransfer.files?.[0]
        if (!file) return
        try {
            const result = await uploadFile(file)
            setUploadedFile({
                id: result.id,
                url: result.url, // file → url
                name: file.name,
            })
        } catch {
            toast.error("File upload failed")
        }
    }

    const onSuccess = () => {
        invalidateByPatternMatch([API.RAW_MATERIAL_ITEMS.INDEX])
        closeModal()
        toast.success("Request created successfully")
    }

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const payload = {
            contract_number: contractNumber,
            supplier: Number(supplier),
            row_items: rows.map((r) => ({
                raw_material: Number(r.raw_material),
                ton: Number(r.ton),
            })),
            row_request_files: uploadedFile ? [uploadedFile.id] : [], // ← ID massivi
        }
        post(API.RAW_MATERIAL_REQUESTS.INDEX, payload, { onSuccess })
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4 min-w-[420px]">
            <CardTitle>New request</CardTitle>

            {/* Contract Number - Added at the beginning */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Contract number</label>
                <input
                    type="text"
                    placeholder="Enter contract number"
                    className="border rounded px-3 py-2 text-sm"
                    value={contractNumber}
                    onChange={(e) => setContractNumber(e.target.value)}
                />
            </div>

            {/* Row items */}
            <div className="flex flex-col gap-2">
                <div className="grid grid-cols-[1fr_80px_auto] gap-2 text-xs text-muted-foreground px-1">
                    <span>Raw material</span>
                    <span>Tonn</span>
                    <span />
                </div>
                {rows.map((row) => (
                    <div
                        key={row.id}
                        className="grid grid-cols-[1fr_80px_auto] gap-2 items-center"
                    >
                        <PaginatedRawMaterialSelect
                            value={row.raw_material}
                            onChange={(value) =>
                                updateRow(row.id, "raw_material", value)
                            }
                        />
                        <input
                            type="number"
                            placeholder="Tonn"
                            className="border rounded px-3 py-2 text-sm"
                            value={row.ton}
                            onChange={(e) =>
                                updateRow(row.id, "ton", e.target.value)
                            }
                        />
                        <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            className="p-1 rounded hover:bg-muted text-red-500 disabled:opacity-30"
                            disabled={rows.length === 1}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addRow}
                    className="flex items-center justify-center gap-2 border border-dashed rounded py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </div>

            {/* Supplier */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Supplier</label>
                <select
                    className="border rounded px-3 py-2 text-sm bg-background"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                >
                    <option value="">Select</option>
                    {supplierOptions.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.company_name}
                        </option>
                    ))}
                </select>
            </div>

            {/* File - bitta */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">File</label>

                {!uploadedFile && !isUploading && (
                    <div
                        className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        <Upload className="w-6 h-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                            File upload
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Select or drag and drop file
                        </span>
                    </div>
                )}

                {isUploading && (
                    <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                        <span className="text-sm text-muted-foreground">
                            Uploading...
                        </span>
                    </div>
                )}

                {uploadedFile && !isUploading && (
                    <div className="relative group mx-auto">
                        {
                            isImage(uploadedFile.url) ?
                                // ── Rasm ──
                                <div className="relative w-36 h-24 rounded-lg overflow-hidden border bg-muted/30">
                                    <img
                                        src={uploadedFile.url}
                                        alt={uploadedFile.name}
                                        className="w-full h-16 object-cover"
                                    />
                                    <p className="text-[10px] mt-0.5 text-center truncate px-1">
                                        {uploadedFile.name}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setUploadedFile(null)}
                                        className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                                // ── File (pdf, docx, xlsx ...) ──
                            :   <div className="relative inline-block">
                                    <FileIcon
                                        url={uploadedFile.url}
                                        name={uploadedFile.name}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setUploadedFile(null)}
                                        className="absolute -top-1.5 -right-1.5 bg-white/80 rounded-full p-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>

                        }
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            <FormAction submitName="Send" loading={isPending || isUploading} />
        </form>
    )
}
