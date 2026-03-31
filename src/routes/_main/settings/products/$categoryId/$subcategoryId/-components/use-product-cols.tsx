import { useModal } from "@/hooks/use-modal"
import type { CellContext, ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useProductStore } from "../-hooks/use-product-store"
import { useProductsQuery } from "../-hooks/use-products-query"
import type { Product } from "../../../-types"
// ─── Actions dropdown ─────────────────────────────────────────────────────────
// eslint-disable-next-line react-refresh/only-export-components
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
export const useProductCols = (): ColumnDef<Product>[] => {
    const { productList } = useProductsQuery()
    const { setProduct } = useProductStore()
    const detailModal = useModal("product-detail")

    const extraKeys = useMemo(() => {
        const keys = new Set<string>()
        for (const p of productList) {
            if (p.extra_fields) {
                for (const k of Object.keys(p.extra_fields)) {
                    keys.add(k)
                }
            }
        }
        return Array.from(keys)
    }, [productList])

    const handleRowClick = (product: Product) => {
        setProduct(product)
        detailModal.openModal()
    }

    const extraCols: ColumnDef<Product>[] = extraKeys.map((key) => ({
        id: `extra_${key}`,
        header: key,
        cell: ({ row: { original } }: CellContext<Product, unknown>) => (
            <TruncatedCell
                value={original.extra_fields?.[key] ?? null}
                onClick={() => handleRowClick(original)}
            />
        ),
    }))

    return [
        {
            accessorKey: "name",
            header: "Product Name",
            cell: ({ row: { original } }: CellContext<Product, unknown>) => (
                <TruncatedCell
                    value={original.name}
                    onClick={() => handleRowClick(original)}
                    maxWidth={200}
                />
            ),
        },
        {
            accessorKey: "code",
            header: "Code",
            cell: ({ row: { original } }: CellContext<Product, unknown>) => (
                <TruncatedCell
                    value={original.code}
                    onClick={() => handleRowClick(original)}
                    maxWidth={100}
                />
            ),
        },
        {
            accessorKey: "articul",
            header: "Articul",
            cell: ({ row: { original } }: CellContext<Product, unknown>) => (
                <TruncatedCell
                    value={original.articul}
                    onClick={() => handleRowClick(original)}
                    maxWidth={120}
                />
            ),
        },
        {
            accessorKey: "price",
            header: "Price",
            cell: ({ row: { original } }: CellContext<Product, unknown>) => (
                <TruncatedCell
                    value={original.price}
                    onClick={() => handleRowClick(original)}
                    maxWidth={100}
                />
            ),
        },
        ...extraCols,
        {
            id: "description",
            header: "Description",
            cell: ({ row: { original } }: CellContext<Product, unknown>) => {
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
            cell: ({ row: { original } }: CellContext<Product, unknown>) => (
                <ProductActions product={original} />
            ),
        },
    ]
}
