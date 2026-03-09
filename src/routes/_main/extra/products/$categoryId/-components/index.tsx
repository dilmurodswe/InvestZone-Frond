import { CustomTable } from "@/components/custom/custom-table"
import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import NoData from "@/components/no-data/nodata"
import Group from "@/components/semantic/group"
import { Button } from "@/components/ui/button"
import { useGet } from "@/hooks/react-query/use-get"
import { useModal } from "@/hooks/use-modal"
import { useNavigate, useParams } from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"
import type { Category } from "../../-types"
import { useSubCategoryStore } from "../-hooks/use-subcategory-store"
import { useSubCategoriesQuery } from "../-hooks/use-subcategories-query"
import SubCategoryAddEditModal from "./subcategory-add-edit"
import SubCategoryDeleteModal from "./subcategory-delete-modal"
import { useSubCategoryCols } from "./use-subcategory-cols"

export default function Index() {
    const { subCategoryList, data, isFetching } = useSubCategoriesQuery()
    const { setSubCategory } = useSubCategoryStore()
    const addModal = useModal("add-subcategory")
    const cols = useSubCategoryCols()
    const { categoryId } = useParams({ strict: false })

    const { data: categoryData } = useGet<Category>(
        `extra/categories/${categoryId}`,
    )
    const navigate = useNavigate()

    return (
        <>
            <Navbar links={[{ label: "Warehouse" }]} />
            <Layout>
                <Group className="flex gap-4 flex-wrap justify-between ">
                    <div className="flex flex-wrap gap-x-2 gap-y-0">
                        <Button className="bg-[#131314] hover:bg-[#131314]" onClick={() => navigate({ to: "/extra/products" })}>
                            Product List
                        </Button>
                        <Button variant="outline" onClick={() => navigate({ to: "/extra/raw-materials" })}>
                            Raw Material List
                        </Button>
                    </div>

                    <Button
                        onClick={() => {
                            setSubCategory(null)
                            addModal.openModal()
                        }}
                    >
                        <PlusIcon />
                        Add Subcategory
                    </Button>
                    <h2
                        className="text-base font-semibold cursor-pointer hover:cursor-pointer w-full"
                        onClick={() => navigate({ to: "/extra/products" })}
                    >
                        {categoryData?.name}
                    </h2>
                </Group>
                {!!subCategoryList.length && (
                    <CustomTable
                        columns={cols}
                        data={subCategoryList}
                        count={data?.count}
                        isLoading={isFetching}
                    />
                )}

                {!subCategoryList.length && !isFetching && (
                    <NoData>
                        <Button
                            onClick={() => {
                                setSubCategory(null)
                                addModal.openModal()
                            }}
                            variant="ghost"
                            className="text-primary"
                        >
                            <PlusIcon />
                            Add Subcategory
                        </Button>
                    </NoData>
                )}

                <SubCategoryAddEditModal />
                <SubCategoryDeleteModal key="delete-subcategory" />
            </Layout>
        </>
    )
}