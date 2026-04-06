import { CustomTable } from "@/components/custom/custom-table"
import FilterInput from "@/components/filter/filter-input"
import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import NoData from "@/components/no-data/nodata"
import Group from "@/components/semantic/group"
import { Button } from "@/components/ui/button"
import { useModal } from "@/hooks/use-modal"
import { PlusIcon } from "lucide-react"
import { useRawMaterialStore } from "../-hooks/use-raw-material-store"
import { useRawMaterialsQuery } from "../-hooks/use-raw-materials-query"
import RawMaterialAddEditModal from "./raw-material-add-edit"
import RawMaterialDeleteModal from "./raw-material-delete-modal"
import RawMaterialDetailModal from "./raw-material-detail-modal"
import { useRawMaterialCols } from "./use-raw-material-cols"

export default function Index() {
    const { rawMaterialList, data, isFetching } = useRawMaterialsQuery()
    const { setRawMaterial } = useRawMaterialStore()
    const addModal = useModal("add-raw-material")
    const cols = useRawMaterialCols()

    return (
        <>
            <Navbar links={[{ label: "Settings" }]} />
            <Layout>
                <Group className="flex gap-4 flex-wrap justify-between">
                    <h2 className="text-2xl font-bold">Raw Material List</h2>

                    <div className="flex gap-x-3">
                        <FilterInput />
                        <Button
                            onClick={() => {
                                setRawMaterial(null)
                                addModal.openModal()
                            }}
                        >
                            <PlusIcon />
                            Add Raw Material
                        </Button>
                    </div>
                </Group>

                {!!rawMaterialList.length && (
                    <div className="overflow-x-auto w-full">
                        <div className="min-w-max">
                            <CustomTable
                                columns={cols}
                                data={rawMaterialList}
                                count={data?.count}
                                isLoading={isFetching}
                            />
                        </div>
                    </div>
                )}

                {!rawMaterialList.length && !isFetching && (
                    <NoData>
                        <Button
                            onClick={() => {
                                setRawMaterial(null)
                                addModal.openModal()
                            }}
                            variant="ghost"
                            className="text-primary"
                        >
                            <PlusIcon />
                            Add Raw Material
                        </Button>
                    </NoData>
                )}

                <RawMaterialAddEditModal />
                <RawMaterialDeleteModal key="delete-raw-material" />
                <RawMaterialDetailModal />
            </Layout>
        </>
    )
}
