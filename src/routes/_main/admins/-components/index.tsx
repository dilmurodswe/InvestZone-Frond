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
import { useAdminStore } from "../-hooks/use-admin-store"
import { useAdminsQuery } from "../-hooks/use-admins-query"
import AdminAddEditModal from "./admin-add-edit"
import { useAdminCols } from "./use-admin-cols"
import AdminDeleteModal from "./admin-delete-modal"

export default function Index() {
    const { adminList, data, isFetching } = useAdminsQuery()
    const { setAdmin } = useAdminStore()

    const addModal = useModal("add-admin")
    // const deleteModal = useModal("delete-admin")

    const cols = useAdminCols()
    const roleOptions = [
        { id: "admin", name: "Admin" },
        { id: "office_manager", name: "Office Manager" },
        { id: "warehouse_employee", name: "Warehouse Employee" },
        { id: "production_manager", name: "Production Manager" },
        { id: "financier", name: "Financier" },
        { id: "master", name: "Master" },
    ]

    return (
        <>
            <Navbar links={[{ label: "Admins" }]} />
            <Layout>
                <Group className="flex gap-4 flex-wrap justify-between">
                    <div className="flex flex-wrap gap-x-2 gap-y-4">
                        <FilterInput />
                        <FilterSelect filterKey="role"
                            placeholder="Role"
                            options={roleOptions} />
                    </div>
                    <Button
                        onClick={() => {
                            addModal.openModal()
                            setAdmin(null)
                        }}
                    >
                        <PlusIcon />
                        Add Admin
                    </Button>
                </Group>

                {!!adminList.length && !isFetching && (
                    <CustomTable
                        columns={cols}
                        data={adminList}
                        count={data?.count}
                    />
                )}

                {!adminList.length && !isFetching && (
                    <NoData>
                        <Button
                            onClick={() => {
                                addModal.openModal()
                                setAdmin(null)
                            }}
                            variant={"ghost"}
                            className="text-primary"
                        >
                            <PlusIcon />
                            Add Admin
                        </Button>
                    </NoData>
                )}

                <AdminAddEditModal />
                <AdminDeleteModal key="delete" />
            </Layout>
        </>
    )
}
