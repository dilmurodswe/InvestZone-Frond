import { CustomTable } from "@/components/custom/custom-table"
import FilterInput from "@/components/filter/filter-input"
import FilterSelect from "@/components/filter/filter-select"
import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import NoData from "@/components/no-data/nodata"
import Group from "@/components/semantic/group"
import { Button } from "@/components/ui/button"
import { useModal } from "@/hooks/use-modal"
import { useNavigate } from "@tanstack/react-router"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useManufacturesQuery } from "../-hooks/use-manufactures-query"
import type { Manufacture } from "../-types"
import ManufactureDeleteModal from "./manufacture-delete-modal"
import ManufactureFilter from "./manufacture-filter"
import NewManufactureModal from "./new-manufacture-modal"
import ManufactureStatusDropdown from "./status-dropdown"
import { getManufactureCols } from "./use-manufacture-cols"
export default function Index() {
    const newManufactureModal = useModal("new-manufacture")
    const { manufactureList, count, isFetching } = useManufacturesQuery()

    const [statusDropdown, setStatusDropdown] = useState<{
        manufacture: Manufacture
        anchorEl: HTMLElement
    } | null>(null)

    const handleStatusClick = (manufacture: Manufacture, el: HTMLElement) => {
        setStatusDropdown({ manufacture, anchorEl: el })
    }

    const navigate = useNavigate()

    const cols = getManufactureCols(handleStatusClick, (manufacture) =>
        navigate({ to: `/manufactures/${manufacture.id}` }),
    )
    const roleOptions = [
        { id: "ready", name: "Ready" },
        { id: "request_sent", name: "Request Sent" },
        { id: "waiting_cert", name: "Waiting for Certificate" },
        { id: "in_progress", name: "In Progress" },
        { id: "completed", name: "Completed" },
    ]
    return (
        <>
            <Navbar links={[{ label: "Manufactures" }]} />
            <Layout>
                <Group className="flex gap-4 flex-wrap justify-between">
                    <div className="flex flex-wrap gap-x-2 gap-y-4">
                        <FilterInput />
                        <FilterSelect
                            filterKey="status"
                            placeholder="Status"
                            options={roleOptions}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <ManufactureFilter />
                        <Button onClick={() => newManufactureModal.openModal()}>
                            <Plus className="w-4 h-4" />
                            New
                        </Button>
                    </div>
                </Group>

                {!!manufactureList.length && (
                    <CustomTable
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
                            New manufacture
                        </Button>
                    </NoData>
                )}

                <NewManufactureModal />
                <ManufactureDeleteModal />

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
