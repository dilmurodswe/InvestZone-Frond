import { useModal } from "@/hooks/use-modal"
import type { CellContext, ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRawMaterialStore } from "../-hooks/use-raw-material-store"
import { useRawMaterialsQuery } from "../-hooks/use-raw-materials-query"
import type { RawMaterial } from "../-types"

// ─── Actions dropdown ─────────────────────────────────────────────────────────
// eslint-disable-next-line react-refresh/only-export-components
function RawMaterialActions({ rawMaterial }: { rawMaterial: RawMaterial }) {
    const [open, setOpen] = useState(false)
    const [pos, setPos] = useState({ top: 0, left: 0 })
    const btnRef = useRef<HTMLButtonElement>(null)
    const ref = useRef<HTMLDivElement>(null)
    const { setRawMaterial } = useRawMaterialStore()
    const addModal = useModal("add-raw-material")
    const deleteModal = useModal("delete-raw-material")

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const handleOpen = () => {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect()
            setPos({
                top: rect.bottom + window.scrollY + 4,
                left: rect.right + window.scrollX - 180,
            })
        }
        setOpen((v) => !v)
    }

    return (
        <div ref={ref} className="relative flex justify-end">
            <button
                ref={btnRef}
                onClick={(e) => {
                    e.stopPropagation()
                    handleOpen()
                }}
                className="p-1 rounded hover:bg-muted"
            >
                <MoreHorizontal className="w-5 h-5" />
            </button>
            {open && (
                <div
                    style={{
                        position: "fixed",
                        top: pos.top,
                        left: pos.left,
                        zIndex: 9999,
                    }}
                    className="bg-white rounded-xl shadow-lg border flex flex-col overflow-hidden"
                >
                    <button
                        style={{ width: 180, height: 40, padding: "0 12px" }}
                        className="flex items-center gap-2 text-sm hover:bg-muted"
                        onClick={(e) => {
                            e.stopPropagation()
                            setRawMaterial(rawMaterial)
                            addModal.openModal()
                            setOpen(false)
                        }}
                    >
                        <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button
                        style={{ width: 180, height: 40, padding: "0 12px" }}
                        className="flex items-center gap-2 text-sm text-red-500 hover:bg-muted"
                        onClick={(e) => {
                            e.stopPropagation()
                            setRawMaterial(rawMaterial)
                            deleteModal.openModal()
                            setOpen(false)
                        }}
                    >
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                </div>
            )}
        </div>
    )
}

// ─── Truncated cell with — fallback ───────────────────────────────────────────
// eslint-disable-next-line react-refresh/only-export-components
function TruncatedCell({
    value,
    onClick,
    maxWidth = 160,
}: {
    value: string | number | null | undefined
    onClick: () => void
    maxWidth?: number
}) {
    const isEmpty = value === undefined || value === null || value === ""
    return (
        <span
            onClick={onClick}
            title={isEmpty ? undefined : String(value)}
            className="text-sm cursor-pointer block truncate"
            style={{ maxWidth }}
        >
            {isEmpty ?
                <span className="text-muted-foreground">—</span>
            :   String(value)}
        </span>
    )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useRawMaterialCols = (): ColumnDef<RawMaterial>[] => {
    const { rawMaterialList } = useRawMaterialsQuery()
    const { setRawMaterial } = useRawMaterialStore()
    const detailModal = useModal("raw-material-detail")

    const extraKeys = useMemo(() => {
        const keys = new Set<string>()
        for (const r of rawMaterialList) {
            if (r.extra_fields) {
                for (const k of Object.keys(r.extra_fields)) {
                    keys.add(k)
                }
            }
        }
        return Array.from(keys)
    }, [rawMaterialList])

    const handleRowClick = (rawMaterial: RawMaterial) => {
        setRawMaterial(rawMaterial)
        detailModal.openModal()
    }

    const extraCols: ColumnDef<RawMaterial>[] = extraKeys.map((key) => ({
        id: `extra_${key}`,
        header: key,
        cell: ({ row: { original } }: CellContext<RawMaterial, unknown>) => (
            <TruncatedCell
                value={original.extra_fields?.[key] ?? null}
                onClick={() => handleRowClick(original)}
            />
        ),
    }))

    return [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({
                row: { original },
            }: CellContext<RawMaterial, unknown>) => (
                <TruncatedCell
                    value={original.name}
                    onClick={() => handleRowClick(original)}
                    maxWidth={200}
                />
            ),
        },
        {
            accessorKey: "standard",
            header: "Standard",
            cell: ({
                row: { original },
            }: CellContext<RawMaterial, unknown>) => (
                <TruncatedCell
                    value={original.standard}
                    onClick={() => handleRowClick(original)}
                    maxWidth={160}
                />
            ),
        },
        {
            accessorKey: "mark",
            header: "Mark",
            cell: ({
                row: { original },
            }: CellContext<RawMaterial, unknown>) => (
                <TruncatedCell
                    value={original.mark}
                    onClick={() => handleRowClick(original)}
                    maxWidth={160}
                />
            ),
        },
        ...extraCols,
        {
            id: "description",
            header: "Description",
            cell: ({
                row: { original },
            }: CellContext<RawMaterial, unknown>) => {
                const plain =
                    original.description ?
                        original.description
                            .replace(/<[^>]*>/g, " ")
                            .replace(/\s+/g, " ")
                            .trim()
                    :   null
                return (
                    <TruncatedCell
                        value={plain}
                        onClick={() => handleRowClick(original)}
                        maxWidth={200}
                    />
                )
            },
        },
        {
            id: "actions",
            header: "",
            cell: ({
                row: { original },
            }: CellContext<RawMaterial, unknown>) => (
                <RawMaterialActions rawMaterial={original} />
            ),
        },
    ]
}
