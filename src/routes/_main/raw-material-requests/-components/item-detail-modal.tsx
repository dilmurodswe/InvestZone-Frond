import { useGet } from "@/hooks/react-query/use-get"
import { useRequest } from "@/hooks/react-query/use-request"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import { Loader2, Plus, Trash2, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface ItemDetailModalProps {
    rowItemId: number
    materialName: string
    contractNumber: string
    onClose: () => void
}

type ItemRow = {
    _id: number
    status: string
    serverId?: number // mavjud bo'lsa PATCH, bo'lmasa POST
    ton: string
    weight: string
    netto: string
    inner_size: string
    outer_size: string
    standard: string
    mark: string
    plank: string
    reference_number: string
    price: string
    wagon: string
}

type ServerItem = {
    id: number
    status: string | null
    ton: number | null
    weight: number | null
    netto: number | null
    inner_size: number | null
    outer_size: number | null
    standard: string | null
    mark: string | null
    plank: string | null
    reference_number: string | null
    price: number | null
    wagon: number | null
}

const EMPTY_ROW = (): ItemRow => ({
    _id: Date.now() + Math.random(),
    serverId: undefined,
    status: "",
    ton: "",
    weight: "",
    netto: "",
    inner_size: "",
    outer_size: "",
    standard: "",
    mark: "",
    plank: "",
    reference_number: "",
    price: "",
    wagon: "",
})

const serverToRow = (item: ServerItem): ItemRow => ({
    _id: item.id,
    serverId: item.id,
    status: item.status ?? "",
    ton: item.ton != null ? String(item.ton) : "",
    weight: item.weight != null ? String(item.weight) : "",
    netto: item.netto != null ? String(item.netto) : "",
    inner_size: item.inner_size != null ? String(item.inner_size) : "",
    outer_size: item.outer_size != null ? String(item.outer_size) : "",
    standard: item.standard ?? "",
    mark: item.mark ?? "",
    plank: item.plank ?? "",
    reference_number: item.reference_number ?? "",
    price: item.price != null ? String(item.price) : "",
    wagon: item.wagon != null ? String(item.wagon) : "",
})

const FIELDS: {
    key: keyof Omit<ItemRow, "_id" | "serverId">
    label: string
    isNumber?: boolean
}[] = [
    { key: "ton", label: "Brutto", isNumber: true },

    { key: "netto", label: "Netto", isNumber: true },
    { key: "inner_size", label: "Inner size", isNumber: true },
    { key: "outer_size", label: "Outer size", isNumber: true },
    { key: "plank", label: "Plank" },
    { key: "reference_number", label: "Reference number" },
    { key: "wagon", label: "Wagon", isNumber: true },
]

const toPayload = (r: ItemRow) => ({
    ton: r.ton ? Number(r.ton) : null,
    weight: r.weight ? Number(r.weight) : null,
    netto: r.netto ? Number(r.netto) : null,
    inner_size: r.inner_size ? Number(r.inner_size) : null,
    outer_size: r.outer_size ? Number(r.outer_size) : null,
    standard: r.standard || null,
    mark: r.mark || null,
    plank: r.plank || null,
    reference_number: r.reference_number || null,
    price: r.price ? Number(r.price) : null,
    wagon: r.wagon ? Number(r.wagon) : null,
})

export default function ItemDetailModal({
    rowItemId,
    materialName,
    contractNumber,
    onClose,
}: ItemDetailModalProps) {
    const { post, patch, isPending } = useRequest()

    // ── GET: mavjud itemlarni yuklash ──
    const { data: serverData, isLoading } = useGet<ServerItem[]>(
        API.RAW_MATERIAL_REQUESTS.ITEM_DETAIL.BY_ROW.replace(
            "{id}",
            String(rowItemId),
        ),
        {
            options: {
                staleTime: 0,
                refetchOnMount: "always",
            },
        },
    )
    const serverItems = getArray<ServerItem>(serverData)

    // BU IKKALASINI SHU BILAN ALMASHTIRING:
    const [extraRows, setExtraRows] = useState<ItemRow[]>([])
    const [editedRows, setEditedRows] = useState<Record<number, ItemRow>>({})

    // server rows + foydalanuvchi qo'shgan yangi rows
    const serverRows =
        isLoading ? []
        : serverItems.length > 0 ? serverItems.map(serverToRow)
        : []
    const rows: ItemRow[] = [
        ...serverRows.map((r) => editedRows[r._id] ?? r),
        ...extraRows,
    ]

    // addRow — extraRows ga qo'shadi
    const addRow = () => setExtraRows((prev) => [...prev, EMPTY_ROW()])

    // removeRow — faqat extraRows dan o'chiradi
    const removeRow = (id: number) => {
        setExtraRows((prev) => prev.filter((r) => r._id !== id))
    }

    // updateRow — server row bo'lsa editedRows ga, yangi row bo'lsa extraRows ga
    const updateRow = (
        id: number,
        field: keyof Omit<ItemRow, "_id" | "serverId">,
        value: string,
    ) => {
        const isServerRow = serverRows.some((r) => r._id === id)
        if (isServerRow) {
            setEditedRows((prev) => ({
                ...prev,
                [id]: {
                    ...(prev[id] ?? serverRows.find((r) => r._id === id)!),
                    [field]: value,
                },
            }))
        } else {
            setExtraRows((prev) =>
                prev.map((r) => (r._id === id ? { ...r, [field]: value } : r)),
            )
        }
    }
    // handleRowBlur — o'zgarmaydi, lekin extraRows uchun PATCH yo'q (serverId yo'q)
    const handleRowBlur = (row: ItemRow) => {
        if (row.serverId) {
            patch(
                API.RAW_MATERIAL_REQUESTS.ITEM_DETAIL.ID.replace(
                    "{id}",
                    String(row.serverId),
                ),
                toPayload(row),
                {},
            )
        }
    }

    // handleSubmit — faqat extraRows ni POST qiladi
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (extraRows.length === 0) {
            toast.success("Saved")
            onClose()
            return
        }

        const items = extraRows.map(toPayload)

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
            <div className="bg-background rounded-xl shadow-2xl w-full max-w-[80vw] mx-4 max-h-[90vh] flex flex-col">
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold">
                            {materialName}
                        </h3>
                        <span className="text-muted-foreground text-sm">|</span>
                        <span className="text-sm text-muted-foreground">
                            {contractNumber}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-muted"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4 overflow-hidden flex-1"
                >
                    <div className="overflow-auto flex-1 px-6 pt-4">
                        {isLoading ?
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        :   <>
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                                Status
                                            </th>
                                            {FIELDS.map((f) => (
                                                <th
                                                    key={f.key}
                                                    className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap"
                                                >
                                                    {f.label}
                                                </th>
                                            ))}
                                            <th className="w-8" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row) => (
                                            <tr
                                                key={row._id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="px-2 py-1.5">
                                                    {row.status ?
                                                        <span
                                                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                                                            style={{
                                                                backgroundColor:
                                                                    (
                                                                        row.status ===
                                                                        "new"
                                                                    ) ?
                                                                        "#e0f2fe"
                                                                    : (
                                                                        row.status ===
                                                                        "in_processing"
                                                                    ) ?
                                                                        "#fef9c3"
                                                                    : (
                                                                        row.status ===
                                                                        "completed"
                                                                    ) ?
                                                                        "#dcfce7"
                                                                    :   "#f1f5f9",
                                                                color:
                                                                    (
                                                                        row.status ===
                                                                        "new"
                                                                    ) ?
                                                                        "#0369a1"
                                                                    : (
                                                                        row.status ===
                                                                        "in_processing"
                                                                    ) ?
                                                                        "#854d0e"
                                                                    : (
                                                                        row.status ===
                                                                        "completed"
                                                                    ) ?
                                                                        "#15803d"
                                                                    :   "#64748b",
                                                            }}
                                                        >
                                                            {(
                                                                row.status ===
                                                                "new"
                                                            ) ?
                                                                "New"
                                                            : (
                                                                row.status ===
                                                                "in_processing"
                                                            ) ?
                                                                "In Processing"
                                                            : (
                                                                row.status ===
                                                                "completed"
                                                            ) ?
                                                                "Completed"
                                                            :   row.status}
                                                        </span>
                                                    :   <span className="text-xs text-muted-foreground">
                                                            —
                                                        </span>
                                                    }
                                                </td>
                                                {FIELDS.map((f) => (
                                                    <td
                                                        key={f.key}
                                                        className="px-2 py-1.5"
                                                    >
                                                        <input
                                                            type={
                                                                f.isNumber ?
                                                                    "number"
                                                                :   "text"
                                                            }
                                                            placeholder="—"
                                                            value={row[f.key]}
                                                            onChange={(e) =>
                                                                updateRow(
                                                                    row._id,
                                                                    f.key,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            onBlur={() =>
                                                                handleRowBlur(
                                                                    row,
                                                                )
                                                            }
                                                            className="w-full min-w-[80px] border rounded px-2 py-1 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                                                        />
                                                    </td>
                                                ))}
                                                <td className="px-2 py-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeRow(row._id)
                                                        }
                                                        disabled={
                                                            rows.length === 1
                                                        }
                                                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-30"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <button
                                    type="button"
                                    onClick={addRow}
                                    className="mt-3 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-dashed rounded-lg px-4 py-2 w-full justify-center hover:bg-muted transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add row
                                </button>
                            </>
                        }
                    </div>

                    {/* ── Footer ── */}
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
