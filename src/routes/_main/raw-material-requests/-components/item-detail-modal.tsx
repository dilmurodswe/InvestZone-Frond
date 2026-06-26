import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useGet } from "@/hooks/react-query/use-get"
import { useRequest } from "@/hooks/react-query/use-request"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { ParseKeys } from "i18next"
import { Loader2, Plus, Trash2, X } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
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
    serverId?: number
    brutto: string
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
    brutto: number | null
    weight: number | null
    netto: number | null
    inner_size: number | null
    outer_size: number | null
    standard: string | null
    mark: string | null
    plank: string | null
    reference_number: string | null
    price: number | null
    wagon: string | null
}

const STATUSES: { value: string; labelKey: ParseKeys }[] = [
    { value: "shipped", labelKey: "status.shipped" },
    { value: "in_uzb", labelKey: "status.inUzb" },
    { value: "at_station", labelKey: "status.atStation" },
    { value: "customs_cleared", labelKey: "status.customsCleared" },
    { value: "received", labelKey: "status.received" },
]

const getStatusIndex = (status: string) =>
    STATUSES.findIndex((s) => s.value === status)

const EMPTY_ROW = (): ItemRow => ({
    _id: Date.now() + Math.random(),
    serverId: undefined,
    status: "shipped",
    brutto: "",
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
    status: item.status ?? "shipped",
    brutto: item.brutto != null ? String(item.brutto) : "",
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
    labelKey: ParseKeys
    isNumber?: boolean
}[] = [
    { key: "brutto", labelKey: "table.brutto", isNumber: true },
    { key: "netto", labelKey: "table.netto", isNumber: true },
    // { key: "inner_size", labelKey: "table.innerSize", isNumber: true },
    // { key: "outer_size", labelKey: "table.outerSize", isNumber: true },
    { key: "plank", labelKey: "table.plank" },
    { key: "reference_number", labelKey: "table.referenceNumber" },
    { key: "wagon", labelKey: "table.wagon" },
]

const toPayload = (r: ItemRow) => ({
    brutto: r.brutto ? Number(r.brutto) : null,
    weight: r.weight ? Number(r.weight) : null,
    netto: r.netto ? Number(r.netto) : null,
    inner_size: r.inner_size ? Number(r.inner_size) : null,
    outer_size: r.outer_size ? Number(r.outer_size) : null,
    standard: r.standard || null,
    mark: r.mark || null,
    plank: r.plank || null,
    reference_number: r.reference_number || null,
    price: r.price ? Number(r.price) : null,
    wagon: r.wagon?.trim() || null,
})

// ─── Status dropdown ──────────────────────────────────────────────────────────
function StatusDropdown({
    row,
    onSelect,
}: {
    row: ItemRow
    onSelect: (row: ItemRow, val: string) => void
}) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const currentIndex = getStatusIndex(row.status)
    const currentStatus = STATUSES.find((s) => s.value === row.status)
    const currentLabel =
        currentStatus ? t(currentStatus.labelKey) : t("common.select")

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center justify-between gap-2 h-8 w-full min-w-[150px] border rounded-md px-3 text-xs bg-background hover:bg-muted transition-colors"
            >
                <span>{currentLabel}</span>
                <svg
                    className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {open && (
                <>
                    <div
                        className="fixed inset-0 z-[9998]"
                        onClick={() => setOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-1 z-[9999] bg-white border rounded-lg shadow-xl overflow-hidden min-w-[160px]">
                        {STATUSES.map((s, i) => {
                            const isDisabled = i < currentIndex
                            const isActive = s.value === row.status
                            return (
                                <button
                                    key={s.value}
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() => {
                                        setOpen(false)
                                        if (!isActive) onSelect(row, s.value)
                                    }}
                                    className={`
                                        flex items-center gap-2 w-full px-3 py-2 text-xs text-left transition-colors
                                        ${isActive ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted"}
                                        ${isDisabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                                    `}
                                >
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? "bg-primary" : "bg-muted-foreground/40"}`}
                                    />
                                    {t(s.labelKey)}
                                </button>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}

// ─── New row status select ────────────────────────────────────────────────────
function NewRowStatusSelect({
    value,
    onChange,
}: {
    value: string
    onChange: (val: string) => void
}) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const currentStatus = STATUSES.find((s) => s.value === value)
    const currentLabel =
        currentStatus ? t(currentStatus.labelKey) : t("common.select")

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center justify-between gap-2 h-8 w-full min-w-[150px] border rounded-md px-3 text-xs bg-background hover:bg-muted transition-colors"
            >
                <span>{currentLabel}</span>
                <svg
                    className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {open && (
                <>
                    <div
                        className="fixed inset-0 z-[9998]"
                        onClick={() => setOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-1 z-[9999] bg-white border rounded-lg shadow-xl overflow-hidden min-w-[160px]">
                        {STATUSES.map((s) => {
                            const isActive = s.value === value
                            return (
                                <button
                                    key={s.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(s.value)
                                        setOpen(false)
                                    }}
                                    className={`
                                        flex items-center gap-2 w-full px-3 py-2 text-xs text-left transition-colors cursor-pointer
                                        ${isActive ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted"}
                                    `}
                                >
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? "bg-primary" : "bg-muted-foreground/40"}`}
                                    />
                                    {t(s.labelKey)}
                                </button>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}

export default function ItemDetailModal({
    rowItemId,
    materialName,
    contractNumber,
    onClose,
}: ItemDetailModalProps) {
    const { t } = useTranslation()
    const { post, patch, isPending } = useRequest()

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

    const [extraRows, setExtraRows] = useState<ItemRow[]>([])
    const [editedRows, setEditedRows] = useState<Record<number, ItemRow>>({})
    const [pendingStatus, setPendingStatus] = useState<{
        rowId: number
        serverId: number
        newStatus: string
    } | null>(null)

    const serverRows =
        isLoading ? []
        : serverItems.length > 0 ? serverItems.map(serverToRow)
        : []

    const rows: ItemRow[] = [
        ...serverRows.map((r) => editedRows[r._id] ?? r),
        ...extraRows,
    ]

    const addRow = () => setExtraRows((prev) => [...prev, EMPTY_ROW()])

    const removeRow = (id: number) => {
        setExtraRows((prev) => prev.filter((r) => r._id !== id))
    }

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (extraRows.length === 0) {
            toast.success(t("rmr.saved"))
            // onClose triggers refetch in parent (RequestDetailModal)
            onClose()
            return
        }

        const items = extraRows.map((r) => ({
            ...toPayload(r),
            status: r.status,
        }))

        post(
            API.RAW_MATERIAL_REQUESTS.ITEM_DETAIL.INDEX,
            { row_item: rowItemId, items },
            {
                onSuccess: () => {
                    toast.success(t("rmr.savedSuccessfully"))
                    // onClose triggers refetch in parent (RequestDetailModal)
                    onClose()
                },
            },
        )
    }

    const handleServerStatusSelect = (row: ItemRow, newStatus: string) => {
        if (!row.serverId) return
        setPendingStatus({
            rowId: row._id,
            serverId: row.serverId,
            newStatus,
        })
    }

    const confirmStatusChange = () => {
        if (!pendingStatus) return
        patch(
            API.RAW_MATERIAL_REQUESTS.ITEM_DETAIL.ID.replace(
                "{id}",
                String(pendingStatus.serverId),
            ),
            { status: pendingStatus.newStatus },
            {
                onSuccess: () => {
                    setEditedRows((prev) => ({
                        ...prev,
                        [pendingStatus.rowId]: {
                            ...(prev[pendingStatus.rowId] ??
                                serverRows.find(
                                    (r) => r._id === pendingStatus.rowId,
                                )!),
                            status: pendingStatus.newStatus,
                        },
                    }))
                    setPendingStatus(null)
                    toast.success(t("rmr.statusUpdated"))
                },
            },
        )
    }

    return (
        <>
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
                <div className="bg-background rounded-xl shadow-2xl w-full max-w-[80vw] mx-4 max-h-[90vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <h3 className="text-base font-semibold">
                                {materialName}
                            </h3>
                            <span className="text-muted-foreground text-sm">
                                |
                            </span>
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
                        <div className="overflow-auto flex-1 px-6 pt-4 min-h-[60vh]">
                            {isLoading ?
                                <div className="flex justify-center py-10">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            :   <>
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                                    {t("table.status")}
                                                </th>
                                                {FIELDS.map((f) => (
                                                    <th
                                                        key={f.key}
                                                        className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap"
                                                    >
                                                        {t(f.labelKey)}
                                                    </th>
                                                ))}
                                                <th className="w-8" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((row) => {
                                                const isNew = !row.serverId
                                                return (
                                                    <tr
                                                        key={row._id}
                                                        className="border-b last:border-0"
                                                    >
                                                        <td className="px-2 py-1.5">
                                                            {isNew ?
                                                                <NewRowStatusSelect
                                                                    value={
                                                                        row.status
                                                                    }
                                                                    onChange={(
                                                                        val,
                                                                    ) =>
                                                                        updateRow(
                                                                            row._id,
                                                                            "status",
                                                                            val,
                                                                        )
                                                                    }
                                                                />
                                                            :   <StatusDropdown
                                                                    row={row}
                                                                    onSelect={
                                                                        handleServerStatusSelect
                                                                    }
                                                                />
                                                            }
                                                        </td>
                                                        {FIELDS.map((f) => (
                                                            <td
                                                                key={f.key}
                                                                className="px-2 py-1.5"
                                                            >
                                                                <input
                                                                    type={
                                                                        (
                                                                            f.isNumber
                                                                        ) ?
                                                                            "number"
                                                                        :   "text"
                                                                    }
                                                                    placeholder="—"
                                                                    value={
                                                                        row[
                                                                            f
                                                                                .key
                                                                        ]
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateRow(
                                                                            row._id,
                                                                            f.key,
                                                                            e
                                                                                .target
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
                                                                    removeRow(
                                                                        row._id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    !isNew
                                                                }
                                                                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-30"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>

                                    <button
                                        type="button"
                                        onClick={addRow}
                                        className="mt-3 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-dashed rounded-lg px-4 py-2 w-full justify-center hover:bg-muted transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        {t("rmr.addRow")}
                                    </button>
                                </>
                            }
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t flex-shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm rounded-lg border hover:bg-muted transition-colors"
                            >
                                {t("common.cancel")}
                            </button>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
                            >
                                {isPending ? t("rmr.saving") : t("common.save")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <AlertDialog
                open={!!pendingStatus}
                onOpenChange={(open) => !open && setPendingStatus(null)}
            >
                <AlertDialogContent className="z-[99999]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("rmr.changeStatus")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("rmr.statusWillChangeTo")}{" "}
                            <span className="font-semibold">
                                {(() => {
                                    const s = STATUSES.find(
                                        (s) =>
                                            s.value ===
                                            pendingStatus?.newStatus,
                                    )
                                    return s ? t(s.labelKey) : ""
                                })()}
                            </span>
                            . {t("rmr.actionCannotBeUndone")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setPendingStatus(null)}
                        >
                            {t("common.cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={confirmStatusChange}>
                            {t("common.confirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
