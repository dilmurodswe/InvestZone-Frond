import { CustomTable } from "@/components/custom/custom-table"
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
import { useRawMaterialCols } from "./use-raw-material-cols"
import { useNavigate } from "@tanstack/react-router"

export default function Index() {
    const { rawMaterialList, data, isFetching } = useRawMaterialsQuery()
    const { setRawMaterial } = useRawMaterialStore()
    const addModal = useModal("add-raw-material")
    const cols = useRawMaterialCols()
    const navigate = useNavigate()
    return (
        <>
            <Navbar links={[{ label: "Warehouse" }]} />
            <Layout>
                <Group className="flex gap-4 flex-wrap justify-between">
                    <div className="flex flex-wrap gap-x-2 gap-y-4">
                        <Button variant="outline" onClick={() => navigate({ to: "/extra/products" })}>
                            Product List
                        </Button>
                        <Button className="bg-[#131314] hover:bg-[#131314]" onClick={() => navigate({ to: "/extra/raw-materials" })}>
                            Raw Material List
                        </Button>
                    </div>

                    <Button
                        onClick={() => {
                            setRawMaterial(null)
                            addModal.openModal()
                        }}
                    >
                        <PlusIcon />
                        Add Raw Material
                    </Button>
                </Group>

                {!!rawMaterialList.length && (
                    <CustomTable
                        columns={cols}
                        data={rawMaterialList}
                        count={data?.count}
                        isLoading={isFetching}
                    />
                )}

                {!rawMaterialList.length && !isFetching && (
                    <NoData>
                        ...
                    </NoData>
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
            </Layout>
        </>
    )
}