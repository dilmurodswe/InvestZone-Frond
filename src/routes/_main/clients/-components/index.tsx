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
import { useClientStore } from "../-hooks/use-client-store"
import { useClientsQuery } from "../-hooks/use-clients-query"
import ClientAddEditModal from "./client-add-edit"
import ClientDeleteModal from "./client-delete-modal"
import ClientDetailModal from "./client-detail-modal"
import { useClientCols } from "./use-admin-cols"

export default function Index() {
    const { clientList, data, isFetching } = useClientsQuery()
    const { setClient } = useClientStore()
    const { openModal } = useModal()
    const cols = useClientCols()
    const { t } = useTranslation()

    return (
        <>
            <Navbar links={[{ label: t("nav.clients") }]} />
            <Layout>
                <Group className="flex gap-4 flex-wrap justify-between">
                    <div className="flex flex-wrap gap-y-4 gap-x-2">
                        <FilterInput />
                        <FilterSelect filterKey="test" />
                    </div>
                    <Button
                        onClick={() => {
                            openModal()
                            setClient(null)
                        }}
                    >
                        <PlusIcon />
                        {t("common.addEntity", { entity: t("entity.client") })}
                    </Button>
                </Group>

                {!!clientList.length && !isFetching && (
                    <CustomTable
                        columns={cols}
                        data={clientList}
                        count={data?.count}
                    />
                )}
                {!clientList.length && !isFetching && (
                    <NoData>
                        <Button
                            onClick={() => {
                                openModal()
                                setClient(null)
                            }}
                            variant="ghost"
                            className="text-primary"
                        >
                            <PlusIcon />
                            {t("common.addEntity", {
                                entity: t("entity.client"),
                            })}
                        </Button>
                    </NoData>
                )}

                <ClientAddEditModal />
                <ClientDeleteModal key="delete" />
                <ClientDetailModal />
            </Layout>
        </>
    )
}
