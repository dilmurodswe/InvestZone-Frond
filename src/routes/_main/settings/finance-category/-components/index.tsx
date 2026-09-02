import { CustomTable } from "@/components/custom/custom-table"
import NoData from "@/components/no-data/nodata"
import { Button } from "@/components/ui/button"
import { useModal } from "@/hooks/use-modal"
import type { ColumnDef } from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, PlusIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useFcStore } from "../-hooks/use-fc-store"
import {
    useFinanceCategoriesQuery,
    useFinanceSubcategoriesQuery,
    type FinanceCategory,
} from "../../../finance/-hooks/use-finance-categories"
import {
    CategoryAddEditModal,
    CategoryDeleteModal,
    SubcategoryAddEditModal,
    SubcategoryDeleteModal,
} from "./category-modals"

export default function FinanceCategoryPage() {
    const { t } = useTranslation()
    const { kind, setKind, selectedCategory, setSelectedCategory, setEditing } =
        useFcStore()

    const { categoryList, isFetching: catFetching } =
        useFinanceCategoriesQuery(kind)
    const { subcategoryList, isFetching: subFetching } =
        useFinanceSubcategoriesQuery(selectedCategory?.id ?? null)

    const catModal = useModal("fc-category")
    const catDeleteModal = useModal("fc-category-delete")
    const subModal = useModal("fc-subcategory")
    const subDeleteModal = useModal("fc-subcategory-delete")

    const inside = selectedCategory != null

    const nameCol = (withChevron: boolean): ColumnDef<FinanceCategory>[] => [
        {
            accessorKey: "name",
            header: t("table.name"),
            cell: ({ row }) => (
                <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">
                        {row.original.name}
                    </span>
                    {withChevron && (
                        <ChevronRight className="size-4 text-muted-foreground" />
                    )}
                </div>
            ),
        },
    ]

    return (
        <>
            {inside ?
                <>
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={() => setSelectedCategory(null)}
                            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                        >
                            <ChevronLeft className="size-4" />
                            {t("finCat.categories")}
                        </button>
                        <Button
                            size="sm"
                            onClick={() => {
                                setEditing(null)
                                subModal.openModal()
                            }}
                        >
                            <PlusIcon /> {t("common.add")}
                        </Button>
                    </div>

                    <h2 className="mb-3 text-lg font-bold">
                        {t("finCat.subcategories")} — {selectedCategory?.name}
                    </h2>

                    {subcategoryList.length ?
                        <CustomTable
                            columns={nameCol(false)}
                            data={subcategoryList}
                            isLoading={subFetching}
                            onEdit={({ original }) => {
                                setEditing(original)
                                subModal.openModal()
                            }}
                            onDelete={({ original }) => {
                                setEditing(original)
                                subDeleteModal.openModal()
                            }}
                        />
                    :   !subFetching && <NoData />}
                </>
            :   <>
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            {(["expense", "income"] as const).map((k) => (
                                <Button
                                    key={k}
                                    size="sm"
                                    variant={kind === k ? "default" : "outline"}
                                    onClick={() => setKind(k)}
                                >
                                    {k === "expense" ?
                                        t("finCat.expense")
                                    :   t("finCat.income")}
                                </Button>
                            ))}
                        </div>
                        <Button
                            size="sm"
                            onClick={() => {
                                setEditing(null)
                                catModal.openModal()
                            }}
                        >
                            <PlusIcon /> {t("common.add")}
                        </Button>
                    </div>

                    <h2 className="mb-3 text-lg font-bold">
                        {t("finCat.categories")}
                    </h2>

                    {categoryList.length ?
                        <CustomTable
                            columns={nameCol(true)}
                            data={categoryList}
                            isLoading={catFetching}
                            onRowClick={(c) => setSelectedCategory(c)}
                            onEdit={({ original }) => {
                                setEditing(original)
                                catModal.openModal()
                            }}
                            onDelete={({ original }) => {
                                setEditing(original)
                                catDeleteModal.openModal()
                            }}
                        />
                    :   !catFetching && <NoData />}
                </>
            }

            <CategoryAddEditModal />
            <CategoryDeleteModal />
            <SubcategoryAddEditModal />
            <SubcategoryDeleteModal />
        </>
    )
}
