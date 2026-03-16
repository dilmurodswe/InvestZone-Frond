import { CustomTable } from "@/components/custom/custom-table"
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
    const { requestList, isFetching } = useRequestsQuery()
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

    return (
        <>
            <Navbar links={[{ label: "Raw materials requests" }]} />
            <Layout>
                <Group className="flex gap-4 flex-wrap justify-between">
                    <h2 className="text-base font-semibold">
                        Raw materials requests
                    </h2>
                    <Button onClick={() => newRequestModal.openModal()}>
                        <Plus className="w-4 h-4" />
                        Request
                    </Button>
                </Group>

                {!!requestList.length && (
                    <CustomTable
                        columns={cols}
                        data={requestList}
                        count={requestList.length}
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
