import { CustomTable } from "@/components/custom/custom-table"
import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import NoData from "@/components/no-data/nodata"
import Group from "@/components/semantic/group"
import { Button } from "@/components/ui/button"
import { useModal } from "@/hooks/use-modal"
import { PlusIcon } from "lucide-react"
import { useCategoriesQuery } from "../-hooks/use-categories-query"
import { useCategoryStore } from "../-hooks/use-category-store"
import CategoryAddEditModal from "./category-add-edit"
import CategoryDeleteModal from "./category-delete-modal"
import { useCategoryCols } from "./use-category-cols"

export default function Index() {
    const { categoryList, isFetching } = useCategoriesQuery()
    const { setCategory } = useCategoryStore()
    const addModal = useModal("add-category")
    const cols = useCategoryCols()

    return (
        <>
            <Navbar links={[{ label: "Settings" }]} />
            <Layout>
                <Group className="flex gap-4 flex-wrap justify-between">
                    <h2 className="text-2xl font-bold">Product List</h2>

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
