import type { ColumnDef } from "@tanstack/react-table"
import type { RawMaterial } from "../-types"
import { useState, useRef, useEffect } from "react"
import { useRawMaterialStore } from "../-hooks/use-raw-material-store"
import { useModal } from "@/hooks/use-modal"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"

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
                    style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
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

export const useRawMaterialCols = (): ColumnDef<RawMaterial>[] => {
    return [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row: { original } }) => (
                <span className="text-sm font-medium">{original.name}</span>
            ),
        },
        {
            accessorKey: "standard",
            header: "Standard",
            cell: ({ row: { original } }) => (
                <span className="text-sm">{original.standard}</span>
            ),
        },
        {
            accessorKey: "mark",
            header: "Mark",
            cell: ({ row: { original } }) => (
                <span className="text-sm">{original.mark}</span>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row: { original } }) => (
                <RawMaterialActions rawMaterial={original} />
            ),
        },
    ]
}