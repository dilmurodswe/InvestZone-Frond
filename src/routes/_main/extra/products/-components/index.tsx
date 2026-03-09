import { CustomTable } from "@/components/custom/custom-table"
import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import NoData from "@/components/no-data/nodata"
import Group from "@/components/semantic/group"
import { Button } from "@/components/ui/button"
import { useModal } from "@/hooks/use-modal"
import { PlusIcon } from "lucide-react"
import { useCategoryStore } from "../-hooks/use-category-store"
import { useCategoriesQuery } from "../-hooks/use-categories-query"
import CategoryAddEditModal from "./category-add-edit"
import CategoryDeleteModal from "./category-delete-modal"
import { useCategoryCols } from "./use-category-cols"
import { useNavigate } from "@tanstack/react-router"

export default function Index() {
    const { categoryList, isFetching } = useCategoriesQuery()
    const { setCategory } = useCategoryStore()
    const addModal = useModal("add-category")
    const cols = useCategoryCols()
    const navigate = useNavigate()

    return (
        <>
            <Navbar links={[{ label: "Warehouse" }]} />
            <Layout>
                <Group className="flex gap-4 flex-wrap justify-between">
                    <div className="flex flex-wrap gap-x-2 gap-y-4 ">
                        <Button className="bg-[#131314] hover:bg-[#131314]" onClick={() => navigate({ to: "/extra/products" })}>
                            Product List
                        </Button>
                        <Button variant="outline" onClick={() => navigate({ to: "/extra/raw-materials" })}>
                            Raw Material List
                        </Button>
                    </div>

                    <Button
                        onClick={() => {
                            setCategory(null)
                            addModal.openModal()
                        }}
                    >
                        <PlusIcon />
                        Add Category
                    </Button>
                </Group>

                {!!categoryList.length && (
                    <CustomTable
                        columns={cols}
                        data={categoryList}
                        isLoading={isFetching}
                    />
                )}

                {!categoryList.length && !isFetching && (
                    <NoData>
                        <Button
                            onClick={() => {
                                setCategory(null)
                                addModal.openModal()
                            }}
                            variant="ghost"
                            className="text-primary"
                        >
                            <PlusIcon />
                            Add Category
                        </Button>
                    </NoData>
                )}

                <CategoryAddEditModal />
                <CategoryDeleteModal key="delete-category" />
            </Layout>
        </>
    )
}