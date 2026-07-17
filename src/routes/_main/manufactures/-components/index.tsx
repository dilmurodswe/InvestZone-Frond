import { CustomTable } from "@/components/custom/custom-table"
import FilterInput from "@/components/filter/filter-input"
import FilterSelect from "@/components/filter/filter-select"
import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import NoData from "@/components/no-data/nodata"
import Group from "@/components/semantic/group"
import { Button } from "@/components/ui/button"
import { useModal } from "@/hooks/use-modal"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useManufacturesQuery } from "../-hooks/use-manufactures-query"
import type { Manufacture } from "../-types"
import ManufactureDeleteModal from "./manufacture-delete-modal"
import ManufactureDetailModal from "./manufacture-detail-modal"
import ManufacturePlanFactModal from "./manufacture-plan-fact-modal"
import NewManufactureModal from "./new-manufacture-modal"
import {
    ALL_MANUFACTURE_STATUSES,
    MANUFACTURE_STATUS_CONFIG,
} from "./status-config"
import ManufactureStatusDropdown from "./status-dropdown"
import { getManufactureCols } from "./use-manufacture-cols"

export default function Index() {
    const { t } = useTranslation()
    const newManufactureModal = useModal("new-manufacture")
    const { manufactureList, count, isFetching } = useManufacturesQuery()

    const [statusDropdown, setStatusDropdown] = useState<{
        manufacture: Manufacture
        anchorEl: HTMLElement
    } | null>(null)

    const handleStatusClick = (manufacture: Manufacture, el: HTMLElement) => {
        setStatusDropdown({ manufacture, anchorEl: el })
    }

    // navigate va onRowClick o'chirildi
    const cols = getManufactureCols(handleStatusClick)

    const roleOptions = ALL_MANUFACTURE_STATUSES.map((s) => ({
        id: s,
        name: t(MANUFACTURE_STATUS_CONFIG[s].labelKey as never),
    }))

    return (
        <>
            <Navbar links={[{ label: t("nav.reskaShtrips") }]} />
            <Layout>
                <Group className="flex gap-4 flex-wrap justify-between">
                    <div className="flex flex-wrap gap-x-2 gap-y-4">
                        <FilterInput />
                        <FilterSelect
                            filterKey="status"
                            placeholder={t("table.status")}
                            options={roleOptions}
                        />
                        {/* ManufactureFilter o'chirildi */}
                    </div>
                    <Button onClick={() => newManufactureModal.openModal()}>
                        <Plus className="w-4 h-4" />
                        {t("common.create")}
                    </Button>
                </Group>

                {!!manufactureList.length && (
                    <CustomTable
                        disableNumeration
                        columns={cols}
                        data={manufactureList}
                        count={count}
                        isLoading={isFetching}
                    />
                )}

                {!manufactureList.length && !isFetching && (
                    <NoData>
                        <Button
                            onClick={() => newManufactureModal.openModal()}
                            variant="ghost"
                            className="text-primary"
                        >
                            <Plus className="w-4 h-4" />
                            {t("common.createEntity", {
                                entity: t("entity.manufacture"),
                            })}
                        </Button>
                    </NoData>
                )}

                <ManufactureDetailModal />
                <NewManufactureModal />
                <ManufactureDeleteModal />
                <ManufacturePlanFactModal />

                {statusDropdown && (
                    <ManufactureStatusDropdown
                        manufacture={statusDropdown.manufacture}
                        anchorEl={statusDropdown.anchorEl}
                        onClose={() => setStatusDropdown(null)}
                        onStatusChanged={() => setStatusDropdown(null)}
                    />
                )}
            </Layout>
        </>
    )
}
