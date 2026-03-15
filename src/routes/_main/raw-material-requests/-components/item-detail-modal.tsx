import { useState } from "react"
import { X, Plus, Trash2 } from "lucide-react"
import { useRequest } from "@/hooks/react-query/use-request"
import { toast } from "sonner"
import { API } from "@/lib/constants/api-endpoints"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ItemDetailModalProps {
    rowItemId: number
    materialName: string
    contractNumber: string
    onClose: () => void
}

type ItemRow = {
    _id: number // local only
    ton: string
    weight: string
    netto: string
    plank: string
    reference_number: string
    price: string
    wagon: string
}

const EMPTY_ROW = (): ItemRow => ({
    _id: Date.now() + Math.random(),
    ton: "",
    weight: "",
    netto: "",
    plank: "",
    reference_number: "",
    price: "",
    wagon: "",
})

const FIELDS: { key: keyof Omit<ItemRow, "_id">; label: string; isNumber?: boolean }[] = [
    { key: "ton", label: "Ton", isNumber: true },
    { key: "weight", label: "Weight", isNumber: true },
    { key: "netto", label: "Netto", isNumber: true },
    { key: "plank", label: "Plank" },
    { key: "reference_number", label: "Reference number" },
    { key: "price", label: "Price", isNumber: true },
    { key: "wagon", label: "Wagon", isNumber: true },
]

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function ItemDetailModal({
    rowItemId,
    materialName,
    contractNumber,
    onClose,
}: ItemDetailModalProps) {
    const { post, isPending } = useRequest()
    const [rows, setRows] = useState<ItemRow[]>([EMPTY_ROW()])

    const addRow = () => setRows((prev) => [...prev, EMPTY_ROW()])

    const removeRow = (id: number) => {
        if (rows.length === 1) return
        setRows((prev) => prev.filter((r) => r._id !== id))
    }

    const updateRow = (id: number, field: keyof Omit<ItemRow, "_id">, value: string) => {
        setRows((prev) =>
            prev.map((r) => (r._id === id ? { ...r, [field]: value } : r)),
        )
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const items = rows.map((r) => ({
            ton: r.ton ? Number(r.ton) : undefined,
            weight: r.weight ? Number(r.weight) : null,
            netto: r.netto ? Number(r.netto) : null,
            plank: r.plank || null,
            reference_number: r.reference_number || null,
            price: r.price ? Number(r.price) : null,
            wagon: r.wagon ? Number(r.wagon) : null,
        }))

        post(
            API.RAW_MATERIAL_REQUESTS.ITEM_DETAIL.INDEX,
            { row_item: rowItemId, items },
            {
                onSuccess: () => {
                    toast.success("Saved successfully")
                    onClose()
                },
            },
        )
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
            <div className="bg-background rounded-xl shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold">{materialName}</h3>
                        <span className="text-muted-foreground text-sm">|</span>
                        <span className="text-sm text-muted-foreground">
                            {contractNumber}
                        </span>
                    </div>
                    <button onClick={onClose} className="p-1 rounded hover:bg-muted">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-hidden flex-1">
                    <div className="overflow-auto flex-1 px-6 pt-4">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="border-b">
                                    {FIELDS.map((f) => (
                                        <th
                                            key={f.key}
                                            className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap"
                                        >
                                            {f.label}
                                            {f.key === "ton" && (
                                                <span className="text-red-500 ml-0.5">*</span>
                                            )}
                                        </th>
                                    ))}
                                    <th className="w-8" />
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr key={row._id} className="border-b last:border-0">
                                        {FIELDS.map((f) => (
                                            <td key={f.key} className="px-2 py-1.5">
                                                <input
                                                    type={f.isNumber ? "number" : "text"}
                                                    placeholder="—"
                                                    value={row[f.key]}
                                                    required={f.key === "ton"}
                                                    onChange={(e) =>
                                                        updateRow(row._id, f.key, e.target.value)
                                                    }
                                                    className="w-full min-w-[80px] border rounded px-2 py-1 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                                                />
                                            </td>
                                        ))}
                                        <td className="px-2 py-1.5">
                                            <button
                                                type="button"
                                                onClick={() => removeRow(row._id)}
                                                disabled={rows.length === 1}
                                                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-30"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Add row */}
                        <button
                            type="button"
                            onClick={addRow}
                            className="mt-3 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-dashed rounded-lg px-4 py-2 w-full justify-center hover:bg-muted transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add row
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t flex-shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm rounded-lg border hover:bg-muted transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
                        >
                            {isPending ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}