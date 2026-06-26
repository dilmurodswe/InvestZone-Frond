import { CustomTable } from "@/components/custom/custom-table"
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
import { useRequestsQuery } from "../-hooks/use-requests-query"
import type { RawMaterialRequest } from "../-types"
import NewRequestModal from "./new-request-modal"
import RequestDetailModal from "./request-detail-modal"
import StatusDropdown from "./status-dropdown"
import { useRequestCols } from "./use-request-cols"

export default function Index() {
    const { t } = useTranslation()
    const newRequestModal = useModal("new-request")
    const { requestList, data, isFetching } = useRequestsQuery()
    const [selectedRequest, setSelectedRequest] = useState<{
        data: RawMaterialRequest
        openedAt: number
    } | null>(null)
    const [statusDropdown, setStatusDropdown] = useState<{
        request: RawMaterialRequest
        anchorEl: HTMLElement
    } | null>(null)

    const handleStatusClick = (
        request: RawMaterialRequest,
        el: HTMLElement,
    ) => {
        setStatusDropdown({ request, anchorEl: el })
    }

    const cols = useRequestCols(
        (request: RawMaterialRequest) =>
            setSelectedRequest({
                data: request,
                openedAt: Date.now(),
            }),
        handleStatusClick,
    )
    const roleOptions = [
        { id: "1", name: t("status.newRequest") },
        { id: "2", name: t("status.factory") },
        { id: "3", name: t("status.onRoad") },
        { id: "4", name: t("status.accepted") },
        { id: "5", name: t("status.station") },
        { id: "6", name: t("status.inUzb") },
    ]

    return (
        <>
            <Navbar links={[{ label: t("nav.rawMaterialRequests") }]} />
            <Layout>
                <Group className="flex gap-4 flex-wrap justify-between">
                    <FilterSelect
                        filterKey="status"
                        placeholder={t("table.status")}
                        options={roleOptions}
                    />
                    <Button onClick={() => newRequestModal.openModal()}>
                        <Plus className="w-4 h-4" />
                        {t("rmr.request")}
                    </Button>
                </Group>

                {!!requestList.length && (
                    <CustomTable
                        columns={cols}
                        data={requestList}
                        count={data?.count}
                        isLoading={isFetching}
                    />
                )}

                {!requestList.length && !isFetching && (
                    <NoData>
                        <Button
                            onClick={() => newRequestModal.openModal()}
                            variant="ghost"
                            className="text-primary"
                        >
                            <Plus className="w-4 h-4" />
                            {t("rmr.newRequest")}
                        </Button>
                    </NoData>
                )}

                <NewRequestModal />

                <RequestDetailModal
                    request={selectedRequest?.data ?? null}
                    onClose={() => setSelectedRequest(null)}
                    key={
                        selectedRequest ?
                            `${selectedRequest.data.id}-${selectedRequest.openedAt}`
                        :   "none"
                    }
                />

                {statusDropdown && (
                    <StatusDropdown
                        request={statusDropdown.request}
                        anchorEl={statusDropdown.anchorEl}
                        onClose={() => setStatusDropdown(null)}
                        onStatusChanged={(req) => {
                            setStatusDropdown(null)
                            setSelectedRequest({
                                data: req,
                                openedAt: Date.now(),
                            })
                        }}
                    />
                )}
            </Layout>
        </>
    )
}
