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
import { useRollingPlansQuery } from "../-hooks/use-rolling-plans-query"
import type { RollingPlan } from "../-types"
import NewRollingPlanModal from "./new-rolling-plan-modal"
import RollingPlanDeleteModal from "./rolling-plan-delete-modal"
import RollingPlanDetailModal from "./rolling-plan-detail-modal"
import RollingPlanStatusDropdown from "./status-dropdown"
import { getRollingPlanCols } from "./use-rolling-plan-cols"

export default function Index() {
    const newModal = useModal("new-rolling-plan")
    const { rollingPlanList, count, isFetching } = useRollingPlansQuery()

    const [statusDropdown, setStatusDropdown] = useState<{
        plan: RollingPlan
        anchorEl: HTMLElement
    } | null>(null)

    const handleStatusClick = (plan: RollingPlan, el: HTMLElement) => {
        setStatusDropdown({ plan, anchorEl: el })
    }

    const cols = getRollingPlanCols(handleStatusClick)

    const statusOptions = [
        { id: "on_warehouse", name: "On Warehouse" },
        { id: "in_cutting", name: "In Cutting" },
    ]

    return (
        <>
            <Navbar links={[{ label: "Rolling Plans" }]} />
            <Layout>
                <Group className="flex gap-4 flex-wrap justify-between">
                    <div className="flex flex-wrap gap-x-2 gap-y-4">
                        <FilterInput />
                        <FilterSelect
                            filterKey="status"
                            placeholder="Status"
                            options={statusOptions}
                        />
                    </div>
                    <Button onClick={() => newModal.openModal()}>
                        <Plus className="w-4 h-4" />
                        New
                    </Button>
                </Group>

                {!!rollingPlanList.length && (
                    <CustomTable
                        columns={cols}
                        data={rollingPlanList}
                        count={count}
                        isLoading={isFetching}
                    />
                )}

                {!rollingPlanList.length && !isFetching && (
                    <NoData>
                        <Button
                            onClick={() => newModal.openModal()}
                            variant="ghost"
                            className="text-primary"
                        >
                            <Plus className="w-4 h-4" />
                            New Rolling Plan
                        </Button>
                    </NoData>
                )}

                <RollingPlanDetailModal />
                <NewRollingPlanModal />
                <RollingPlanDeleteModal />

                {statusDropdown && (
                    <RollingPlanStatusDropdown
                        rollingPlan={statusDropdown.plan}
                        anchorEl={statusDropdown.anchorEl}
                        onClose={() => setStatusDropdown(null)}
                        onStatusChanged={() => setStatusDropdown(null)}
                    />
                )}
            </Layout>
        </>
    )
}
