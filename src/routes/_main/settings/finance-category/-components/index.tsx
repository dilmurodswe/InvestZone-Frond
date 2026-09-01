import { CustomTable } from "@/components/custom/custom-table"
import NoData from "@/components/no-data/nodata"
import { Button } from "@/components/ui/button"
import { useModal } from "@/hooks/use-modal"
import type { ColumnDef } from "@tanstack/react-table"
import { PlusIcon } from "lucide-react"
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

    const nameCol: ColumnDef<FinanceCategory>[] = [
        {
            accessorKey: "name",
            header: t("table.name"),
            cell: ({ row }) => (
                <span className="text-sm font-medium">{row.original.name}</span>
            ),
        },
    ]

    return (
        <>
            <div className="mb-4 flex items-center gap-2">
                {(["expense", "income"] as const).map((k) => (
                    <Button
                        key={k}
                        variant={kind === k ? "default" : "outline"}
                        onClick={() => setKind(k)}
                    >
                        {k === "expense" ?
                            t("finCat.expense")
                        :   t("finCat.income")}
                    </Button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-lg font-bold">
                            {t("finCat.categories")}
                        </h2>
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

                    {categoryList.length ?
                        <CustomTable
                            columns={nameCol}
                            data={categoryList}
                            isLoading={catFetching}
                            onRowClick={(c) => setSelectedCategory(c)}
                            rowClassName={(c) =>
                                c.id === selectedCategory?.id ? "bg-muted" : ""
                            }
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
                </div>

                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-lg font-bold">
                            {t("finCat.subcategories")}
                            {selectedCategory ?
                                ` — ${selectedCategory.name}`
                            :   ""}
                        </h2>
                        <Button
                            size="sm"
                            disabled={!selectedCategory}
                            onClick={() => {
                                setEditing(null)
                                subModal.openModal()
                            }}
                        >
                            <PlusIcon /> {t("common.add")}
                        </Button>
                    </div>

                    {!selectedCategory ?
                        <p className="text-sm text-muted-foreground">
                            {t("finCat.pickCategory")}
                        </p>
                    : subcategoryList.length ?
                        <CustomTable
                            columns={nameCol}
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
                </div>
            </div>

            <CategoryAddEditModal />
            <CategoryDeleteModal />
            <SubcategoryAddEditModal />
            <SubcategoryDeleteModal />
        </>
    )
}
