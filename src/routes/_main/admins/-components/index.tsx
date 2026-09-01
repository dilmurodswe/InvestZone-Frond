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
import { useAdminStore } from "../-hooks/use-admin-store"
import { useAdminsQuery } from "../-hooks/use-admins-query"
import AdminAddEditModal from "./admin-add-edit"
import AdminDeleteModal from "./admin-delete-modal"
import { useAdminCols } from "./use-admin-cols"

export default function Index() {
    const { adminList, data, isFetching } = useAdminsQuery()
    const { setAdmin } = useAdminStore()
    const { t } = useTranslation()

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
            <Navbar links={[{ label: t("nav.admins") }]} />
            <Layout>
                <Group className="mb-4 flex flex-wrap items-end justify-between gap-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-muted-foreground">
                                {t("common.search")}
                            </label>
                            <FilterInput className="w-64" />
                        </div>
                        <FilterSelect
                            filterKey="role"
                            label={t("table.role")}
                            options={roleOptions}
                            wrapperClassname="min-w-[200px]"
                        />
                    </div>
                    <Button
                        onClick={() => {
                            addModal.openModal()
                            setAdmin(null)
                        }}
                    >
                        <PlusIcon />
                        {t("common.addEntity", { entity: t("entity.admin") })}
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
                            {t("common.addEntity", {
                                entity: t("entity.admin"),
                            })}
                        </Button>
                    </NoData>
                )}

                <AdminAddEditModal />
                <AdminDeleteModal key="delete" />
            </Layout>
        </>
    )
}
