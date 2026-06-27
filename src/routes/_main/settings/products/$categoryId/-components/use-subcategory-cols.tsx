import { useModal } from "@/hooks/use-modal"
import { useNavigate, useParams } from "@tanstack/react-router"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useSubCategoryStore } from "../-hooks/use-subcategory-store"
import type { SubCategory } from "../../-types"
// eslint-disable-next-line react-refresh/only-export-components
function SubCategoryActions({ subCategory }: { subCategory: SubCategory }) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const [pos, setPos] = useState({ top: 0, left: 0 })
    const btnRef = useRef<HTMLButtonElement>(null)
    const ref = useRef<HTMLDivElement>(null)
    const { setSubCategory } = useSubCategoryStore()
    const addModal = useModal("add-subcategory")
    const deleteModal = useModal("delete-subcategory")

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
                            setSubCategory(subCategory)
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
                            setSubCategory(subCategory)
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

export const useSubCategoryCols = (): ColumnDef<SubCategory>[] => {
    const navigate = useNavigate()
    const { categoryId } = useParams({ strict: false })
    const { t } = useTranslation()

    return [
        {
            accessorKey: "name",
            header: t("table.subcategoryName"),
            cell: ({ row: { original } }) => (
                <button
                    className="w-full text-left text-sm font-medium hover:cursor-pointer hoverbg-primary"
                    onClick={() =>
                        navigate({
                            to: "/settings/products/$categoryId/$subcategoryId",
                            params: {
                                categoryId: String(categoryId),
                                subcategoryId: String(original.id),
                            },
                        })
                    }
                >
                    {original.name}
                </button>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row: { original } }) => (
                <SubCategoryActions subCategory={original} />
            ),
        },
    ]
}
