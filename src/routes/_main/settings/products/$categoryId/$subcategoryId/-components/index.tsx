import { CustomTable } from "@/components/custom/custom-table"
import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import NoData from "@/components/no-data/nodata"
import Group from "@/components/semantic/group"
import { Button } from "@/components/ui/button"
import { useGet } from "@/hooks/react-query/use-get"
import { useModal } from "@/hooks/use-modal"
import { useNavigate, useParams } from "@tanstack/react-router"
import { ChevronRight, PlusIcon } from "lucide-react"
import { useProductStore } from "../-hooks/use-product-store"
import { useProductsQuery } from "../-hooks/use-products-query"
import type { Category, SubCategory } from "../../../-types"
import ProductAddEditModal from "./product-add-edit"
import ProductDeleteModal from "./product-delete-modal"
import ProductDetailModal from "./product-detail-modal"
import { useProductCols } from "./use-product-cols"

export default function Index() {
    const { productList, data, isFetching } = useProductsQuery()
    const { setProduct } = useProductStore()
    const addModal = useModal("add-product")
    const cols = useProductCols()
    const { categoryId, subcategoryId } = useParams({ strict: false })

    const { data: categoryData } = useGet<Category>(
        `extra/categories/${categoryId}`,
    )
    const { data: subCategoryData } = useGet<SubCategory>(
        `extra/subcategories/${subcategoryId}`,
    )
    const navigate = useNavigate()

    return (
        <>
            <Navbar links={[{ label: "Settings" }]} />
            <Layout>
                <Group className="flex gap-4 flex-wrap justify-between">
                    <h2 className="text-2xl font-bold">Product List</h2>

                    <Button
                        onClick={() => {
                            setProduct(null)
                            addModal.openModal()
                        }}
                    >
                        <PlusIcon />
                        Add Product
                    </Button>
                    <h2 className="text-base font-semibold flex items-center gap-x-2 w-full">
                        <span
                            className="cursor-pointer hover:cursor-pointer"
                            onClick={() =>
                                navigate({ to: "/settings/products" })
                            }
                        >
                            {categoryData?.name}
                        </span>
                        <ChevronRight size={22} />
                        <span
                            className="cursor-pointer hover:cursor-pointer"
                            onClick={() =>
                                navigate({
                                    to: "/settings/products/$categoryId",
                                    params: { categoryId: String(categoryId) },
                                })
                            }
                        >
                            {subCategoryData?.name}
                        </span>
                    </h2>
                </Group>

                {!!productList.length && (
                    <div className="overflow-x-auto w-full">
                        <div className="min-w-max">
                            <CustomTable
                                columns={cols}
                                data={productList}
                                count={data?.count}
                                isLoading={isFetching}
                            />
                        </div>
                    </div>
                )}

                {!productList.length && !isFetching && (
                    <NoData>
                        <Button
                            onClick={() => {
                                setProduct(null)
                                addModal.openModal()
                            }}
                            variant="ghost"
                            className="text-primary"
                        >
                            <PlusIcon />
                            Add Product
                        </Button>
                    </NoData>
                )}

                <ProductAddEditModal />
                <ProductDeleteModal key="delete-product" />
                <ProductDetailModal />
            </Layout>
        </>
    )
}
