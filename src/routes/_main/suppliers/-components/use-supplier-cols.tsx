import { Badge } from "@/components/ui/badge"
import { useModal } from "@/hooks/use-modal"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useSupplierStore } from "../-hooks/use-supplier-store"
import type { Supplier } from "../-types"
// eslint-disable-next-line react-refresh/only-export-components
function SupplierActions({ supplier }: { supplier: Supplier }) {
    const [open, setOpen] = useState(false)
    const [pos, setPos] = useState({ top: 0, left: 0 })
    const btnRef = useRef<HTMLButtonElement>(null)
    const ref = useRef<HTMLDivElement>(null)
    const { setSupplier } = useSupplierStore()
    const editModal = useModal()
    const deleteModal = useModal("delete-supplier")

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
                            setSupplier(supplier)
                            editModal.openModal()
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
                            setSupplier(supplier)
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

export const useSupplierCols = (): ColumnDef<Supplier>[] => {
    const { setSupplier } = useSupplierStore()
    const detailModal = useModal("supplier-detail")

    const handleRowClick = (supplier: Supplier) => {
        setSupplier(supplier)
        detailModal.openModal()
    }

    return [
        {
            accessorKey: "company_name",
            header: "Company",
            cell: ({ row: { original } }) => (
                <button
                    className="text-sm font-medium text-left hover:text-primary hover:underline transition-colors"
                    onClick={() => handleRowClick(original)}
                >
                    {original.company_name}
                </button>
            ),
        },
        {
            accessorKey: "company_email",
            header: "Email",
            cell: ({ row: { original } }) => (
                <span
                    className="text-sm text-muted-foreground cursor-pointer"
                    onClick={() => handleRowClick(original)}
                >
                    {original.company_email || "—"}
                </span>
            ),
        },
        {
            accessorKey: "customer_type",
            header: "Supplier type",
            cell: ({ row: { original } }) => (
                <span
                    className="cursor-pointer"
                    onClick={() => handleRowClick(original)}
                >
                    {original.customer_type ?
                        <Badge
                            variant="secondary"
                            className="capitalize font-semibold text-xs"
                        >
                            {original.customer_type}
                        </Badge>
                    :   <span className="text-sm text-muted-foreground">—</span>
                    }
                </span>
            ),
        },
        {
            accessorKey: "region_address",
            header: "Address",
            cell: ({ row: { original } }) => (
                <span
                    className="text-sm cursor-pointer"
                    onClick={() => handleRowClick(original)}
                >
                    {original.legal_address || "—"}
                </span>
            ),
        },
        {
            accessorKey: "inn",
            header: "INN",
            cell: ({ row: { original } }) => (
                <span
                    className="text-sm cursor-pointer"
                    onClick={() => handleRowClick(original)}
                >
                    {original.inn || "—"}
                </span>
            ),
        },
        {
            accessorKey: "full_name",
            header: "CEO/Staff",
            cell: ({ row: { original } }) => (
                <span
                    className="text-sm cursor-pointer"
                    onClick={() => handleRowClick(original)}
                >
                    {original.full_name}
                </span>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row: { original } }) => (
                <SupplierActions supplier={original} />
            ),
        },
    ]
}
