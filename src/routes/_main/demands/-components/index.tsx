import { CustomTable } from "@/components/custom/custom-table"
import FilterInput from "@/components/filter/filter-input"
import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import NoData from "@/components/no-data/nodata"
import Group from "@/components/semantic/group"
import { useTranslation } from "react-i18next"
import { useDemandsQuery } from "../-hooks/use-demands-query"
import DemandDeleteModal from "./demand-delete-modal"
import DemandDetailModal from "./demand-detail-modal"
import DemandEditModal from "./demand-edit-modal"
import DemandPrintModal from "./demand-print-modal"
import { getDemandCols } from "./use-demand-cols"

export default function DemandsPage() {
    const { t } = useTranslation()
    const { demandList, count, isFetching } = useDemandsQuery()
    const cols = getDemandCols()

    return (
        <>
            <Navbar links={[{ label: t("nav.demands") }]} />
            <Layout>
                <Group className="flex gap-4 flex-wrap justify-between">
                    <div className="flex flex-wrap gap-x-2 gap-y-4">
                        <FilterInput />
                    </div>
                </Group>

                {!!demandList.length && (
                    <CustomTable
                        columns={cols}
                        data={demandList}
                        count={count}
                        isLoading={isFetching}
                    />
                )}

                {/* Shipments are always created from an order, never here. */}
                {!demandList.length && !isFetching && <NoData />}

                <DemandDetailModal />
                <DemandPrintModal />
                <DemandEditModal />
                <DemandDeleteModal />
            </Layout>
        </>
    )
}
