import type { ColumnDef } from "@tanstack/react-table"
import type { Product } from "../../../-types"
import { useState, useRef, useEffect } from "react"
import { useProductStore } from "../-hooks/use-product-store"
import { useModal } from "@/hooks/use-modal"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"

function ProductActions({ product }: { product: Product }) {
    const [open, setOpen] = useState(false)
    const [pos, setPos] = useState({ top: 0, left: 0 })
    const btnRef = useRef<HTMLButtonElement>(null)
    const ref = useRef<HTMLDivElement>(null)
    const { setProduct } = useProductStore()
    const addModal = useModal("add-product")
    const deleteModal = useModal("delete-product")

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
                            setProduct(product)
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
                            setProduct(product)
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

export const useProductCols = (): ColumnDef<Product>[] => {
    return [
        {
            accessorKey: "name",
            header: "Product Name",
            cell: ({ row: { original } }) => (
                <span className="text-sm font-medium">{original.name}</span>
            ),
        },
        {
            accessorKey: "code",
            header: "Code",
            cell: ({ row: { original } }) => (
                <span className="text-sm">{original.code}</span>
            ),
        },
        {
            accessorKey: "articul",
            header: "Articul",
            cell: ({ row: { original } }) => (
                <span className="text-sm">{original.articul}</span>
            ),
        },
        {
            accessorKey: "price",
            header: "Price",
            cell: ({ row: { original } }) => (
                <span className="text-sm">{original.price}</span>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row: { original } }) => <ProductActions product={original} />,
        },
    ]
}