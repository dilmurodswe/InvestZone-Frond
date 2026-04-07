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
import { useRequestsQuery } from "../-hooks/use-requests-query"
import type { RawMaterialRequest } from "../-types"
import NewRequestModal from "./new-request-modal"
import RequestDetailModal from "./request-detail-modal"
import StatusDropdown from "./status-dropdown"
import { useRequestCols } from "./use-request-cols"

export default function Index() {
    const newRequestModal = useModal("new-request")
    const { requestList, data, isFetching } = useRequestsQuery()
    const [selectedRequest, setSelectedRequest] =
        useState<RawMaterialRequest | null>(null)
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
        (request: RawMaterialRequest) => setSelectedRequest(request),
        handleStatusClick,
    )
    const roleOptions = [
        { id: "1", name: "New request" },
        { id: "2", name: "Factory" },
        { id: "3", name: "On road" },
        { id: "4", name: "Accepted" },
        { id: "5", name: "Station" },
        { id: "6", name: "In UZB" },
        { id: "7", name: "Paid" },
        { id: "8", name: "Customs Clearance" },
        { id: "9", name: "Arrived Warehouse" },
        { id: "10", name: "Production Again" },
        { id: "11", name: "Partially Shipped" },
        { id: "12", name: "Cancelled" },
    ]

    return (
        <>
            <Navbar links={[{ label: "Raw materials requests" }]} />
            <Layout>
                <Group className="flex gap-4 flex-wrap justify-between">
                    <FilterSelect
                        filterKey="status"
                        placeholder="Status"
                        options={roleOptions}
                    />
                    <Button onClick={() => newRequestModal.openModal()}>
                        <Plus className="w-4 h-4" />
                        Request
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
                            New Request
                        </Button>
                    </NoData>
                )}

                <NewRequestModal />

                <RequestDetailModal
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                />

                {statusDropdown && (
                    <StatusDropdown
                        request={statusDropdown.request}
                        anchorEl={statusDropdown.anchorEl}
                        onClose={() => setStatusDropdown(null)}
                        onStatusChanged={(req) => {
                            setStatusDropdown(null)
                            setSelectedRequest(req)
                        }}
                    />
                )}
            </Layout>
        </>
    )
}
