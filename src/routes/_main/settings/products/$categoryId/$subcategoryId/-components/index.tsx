import { CustomTable } from "@/components/custom/custom-table"
import FilterInput from "@/components/filter/filter-input"
import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import NoData from "@/components/no-data/nodata"
import Group from "@/components/semantic/group"
import { Button } from "@/components/ui/button"
import { useGet } from "@/hooks/react-query/use-get"
import { useModal } from "@/hooks/use-modal"
import { useStoredSet } from "@/hooks/use-stored-set"
import { useNavigate, useParams } from "@tanstack/react-router"
import { ChevronRight, PlusIcon } from "lucide-react"
import { useProductStore } from "../-hooks/use-product-store"
import { useProductsQuery } from "../-hooks/use-products-query"
import type { Category, SubCategory } from "../../../-types"
import ProductAddEditModal from "./product-add-edit"
import ProductDeleteModal from "./product-delete-modal"
import ProductDetailModal from "./product-detail-modal"
import {
    extraColumnId,
    PRODUCT_BASE_COLUMNS,
    useProductCols,
} from "./use-product-cols"
// import { ExtraFieldFilter } from "./ExtraFieldFilter"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { ColumnToggle, type ColumnOption } from "./column-toggle"

export default function Index() {
    const { t } = useTranslation()
    const { productList, data, isFetching } = useProductsQuery()
    const { setProduct } = useProductStore()
    const addModal = useModal("add-product")
    const extraKeys = useMemo(() => {
        const keys = new Set<string>()
        for (const p of productList) {
            if (p.extra_fields) {
                for (const k of Object.keys(p.extra_fields)) keys.add(k)
            }
        }
        return Array.from(keys)
    }, [productList])

    // «Columns» гасит любую колонку — и собственную колонку товара, и доп.
    // поле карточки. Кроме названия: без него строку не опознать. Набор
    // общий на весь справочник товаров и переживает перезагрузку: таблицу
    // настраивают под себя один раз, а не заново после каждого F5.
    const { value: hiddenColumns, toggle: toggleColumn } = useStoredSet(
        "products:hidden-columns",
    )
    const columnOptions: ColumnOption[] = useMemo(
        () => [
            ...PRODUCT_BASE_COLUMNS.map((c) => ({
                id: c.id,
                label: t(c.labelKey),
                locked: "locked" in c ? c.locked : undefined,
            })),
            ...extraKeys.map((key) => ({
                id: extraColumnId(key),
                label: key,
                extra: true,
            })),
        ],
        [extraKeys, t],
    )
    const cols = useProductCols(hiddenColumns)
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

                    <div className="flex gap-x-2">
                        {/* <ExtraFieldFilter /> */}
                        <FilterInput />
                        <ColumnToggle
                            options={columnOptions}
                            hidden={hiddenColumns}
                            onToggle={toggleColumn}
                        />
                        <Button
                            onClick={() => {
                                setProduct(null)
                                addModal.openModal()
                            }}
                        >
                            <PlusIcon />
                            Add Product
                        </Button>
                    </div>
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
