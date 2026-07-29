import { useGet } from "@/hooks/react-query/use-get"
import { useModal } from "@/hooks/use-modal"
import { round3 } from "@/lib/utils/format-number"
import { useParams } from "@tanstack/react-router"
import type { CellContext, ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useProductStore } from "../-hooks/use-product-store"
import { useProductsQuery } from "../-hooks/use-products-query"
import type { Category, Product } from "../../../-types"

// ─── Actions dropdown ─────────────────────────────────────────────────────────
// eslint-disable-next-line react-refresh/only-export-components
function ProductActions({ product }: { product: Product }) {
    const { t } = useTranslation()
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
                        <Pencil className="w-4 h-4" /> {t("common.edit")}
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
                        <Trash2 className="w-4 h-4" /> {t("common.delete")}
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

/**
 * Собственные колонки товара — в том порядке, в каком стоят в таблице.
 * Список нужен и таблице, и меню «Columns», поэтому живёт здесь.
 * Название не выключается: по нему строку и опознают.
 */
export const PRODUCT_BASE_COLUMNS = [
    { id: "name", labelKey: "table.productName", locked: true },
    { id: "code", labelKey: "table.code" },
    { id: "articul", labelKey: "table.sku" },
    { id: "price", labelKey: "table.price" },
    { id: "theoretically_price", labelKey: "table.theoreticalPrice" },
    { id: "factually_price", labelKey: "table.factualPrice" },
    { id: "outer_dimension", labelKey: "table.outerSizeMm" },
    { id: "thickness", labelKey: "table.thickness" },
    { id: "description", labelKey: "table.description" },
] as const

/** Id колонки доп. поля — им же она помечена в наборе скрытых. */
export const extraColumnId = (key: string) => `extra_${key}`

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useProductCols = (
    hiddenColumns: Set<string>,
): ColumnDef<Product>[] => {
    const { t } = useTranslation()
    const { productList } = useProductsQuery()
    const { setProduct } = useProductStore()
    const detailModal = useModal("product-detail")
    const { categoryId } = useParams({ strict: false })

    // Fetch category to check if truba
    const { data: categoryData } = useGet<Category>(
        `extra/categories/${categoryId}`,
    )
    const isTruba = categoryData?.type === "truba"
    console.log(isTruba)

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
        id: extraColumnId(key),
        header: key,
        cell: ({ row: { original } }: CellContext<Product, unknown>) => (
            <TruncatedCell
                value={original.extra_fields?.[key] ?? null}
                onClick={() => handleRowClick(original)}
            />
        ),
    }))

    const outerDimensionCol: ColumnDef<Product> = {
        id: "outer_dimension",
        header: t("table.outerSizeMm"),
        cell: ({ row: { original } }: CellContext<Product, unknown>) => (
            <TruncatedCell
                value={original.outer_dimension ?? null}
                onClick={() => handleRowClick(original)}
                maxWidth={160}
            />
        ),
    }

    const thicknessCol: ColumnDef<Product> = {
        id: "thickness",
        header: t("table.thickness"),
        cell: ({ row: { original } }: CellContext<Product, unknown>) => (
            <TruncatedCell
                value={original.thickness ?? null}
                onClick={() => handleRowClick(original)}
                maxWidth={100}
            />
        ),
    }

    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: "name",
            header: t("table.productName"),
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
            header: t("table.code"),
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
            header: t("table.sku"),
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
            header: t("table.price"),
            cell: ({ row: { original } }: CellContext<Product, unknown>) => (
                <TruncatedCell
                    value={round3(original.price)}
                    onClick={() => handleRowClick(original)}
                    maxWidth={100}
                />
            ),
        },
        {
            accessorKey: "theoretically_price",
            header: t("table.theoreticalPrice"),
            cell: ({ row: { original } }: CellContext<Product, unknown>) => (
                <TruncatedCell
                    value={round3(original.theoretically_price)}
                    onClick={() => handleRowClick(original)}
                    maxWidth={100}
                />
            ),
        },
        {
            accessorKey: "factually_price",
            header: t("table.factualPrice"),
            cell: ({ row: { original } }: CellContext<Product, unknown>) => (
                <TruncatedCell
                    value={round3(original.factually_price)}
                    onClick={() => handleRowClick(original)}
                    maxWidth={100}
                />
            ),
        },
        // Наружный размер, мм — always visible
        outerDimensionCol,
        thicknessCol,
        ...extraCols,
        {
            id: "description",
            header: t("table.description"),
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

    // Меню «Columns» гасит колонки по id — у колонок с `accessorKey` он же и
    // есть id. Название и кнопки строки остаются всегда.
    return columns.filter((column) => {
        const id =
            column.id ??
            ("accessorKey" in column ? String(column.accessorKey) : "")
        return id === "actions" || !hiddenColumns.has(id)
    })
}
