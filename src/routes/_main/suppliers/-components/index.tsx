import { CustomTable } from "@/components/custom/custom-table"
import FilterInput from "@/components/filter/filter-input"
import FilterSelect from "@/components/filter/filter-select"
import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import NoData from "@/components/no-data/nodata"
import Group from "@/components/semantic/group"
import { Button } from "@/components/ui/button"
import { useModal } from "@/hooks/use-modal"
import { PlusIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useSupplierStore } from "../-hooks/use-supplier-store"
import { useSuppliersQuery } from "../-hooks/use-suppliers-query"
import SupplierAddEditModal from "./supplier-add-edit"
import SupplierDeleteModal from "./supplier-delete-modal"
import SupplierDetailModal from "./supplier-detail-modal"
import { useSupplierCols } from "./use-supplier-cols"

export default function Index() {
    const { supplierList, data, isFetching } = useSuppliersQuery()
    const { setSupplier } = useSupplierStore()
    const { openModal } = useModal()
    const cols = useSupplierCols()
    const { t } = useTranslation()

    return (
        <>
            <Navbar links={[{ label: t("nav.suppliers") }]} />
            <Layout>
                <Group className="flex gap-4 flex-wrap justify-between">
                    <div className="flex flex-wrap gap-y-4 gap-x-2">
                        <FilterInput />
                        <FilterSelect filterKey="test" />
                    </div>
                    <Button
                        onClick={() => {
                            openModal()
                            setSupplier(null)
                        }}
                    >
                        <PlusIcon />
                        {t("common.addEntity", {
                            entity: t("entity.supplier"),
                        })}
                    </Button>
                </Group>

                {!!supplierList.length && !isFetching && (
                    <CustomTable
                        columns={cols}
                        data={supplierList}
                        count={data?.count}
                    />
                )}
                {!supplierList.length && !isFetching && (
                    <NoData>
                        <Button
                            onClick={() => {
                                openModal()
                                setSupplier(null)
                            }}
                            variant="ghost"
                            className="text-primary"
                        >
                            <PlusIcon />
                            {t("common.addEntity", {
                                entity: t("entity.supplier"),
                            })}
                        </Button>
                    </NoData>
                )}

                <SupplierAddEditModal />
                <SupplierDeleteModal key="delete" />
                <SupplierDetailModal />
            </Layout>
        </>
    )
}
