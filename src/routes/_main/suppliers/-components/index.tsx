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
import { useSupplierStore } from "../-hooks/use-supplier-store"
import SupplierAddEditModal from "./supplier-add-edit"
import { useSupplierCols } from "./use-supplier-cols"
import { useSuppliersQuery } from "../-hooks/use-suppliers-query"
import SupplierDeleteModal from "./supplier-delete-modal"
import SupplierDetailModal from "./supplier-detail-modal"

export default function Index() {
    const { supplierList, data, isFetching } = useSuppliersQuery()
    const { setSupplier } = useSupplierStore()
    const { openModal } = useModal()
    const cols = useSupplierCols()

    return (
        <>
            <Navbar links={[{ label: "Suppliers" }]} />
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
                        Add Supplier
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
                            Add Supplier
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