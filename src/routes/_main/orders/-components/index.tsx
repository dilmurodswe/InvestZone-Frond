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
import { useOrderStore } from "../-hooks/use-order-store"
import { useOrdersQuery } from "../-hooks/use-orders-query"
import { getOrderCols } from "./get-order-cols"
import OrderAddEditModal from "./order-add-edit"
import OrderDeleteModal from "./order-delete-modal"
import OrderDetailModal from "./order-detail-modal"

export default function OrdersPage() {
    const { orderList, isFetching } = useOrdersQuery()
    const { setOrder } = useOrderStore()
    const addModal = useModal("add-order")
    const cols = getOrderCols()
    const roleOptions = [
        { id: "new", name: "New" },
        { id: "in_processing", name: "In Processing" },
        { id: "completed", name: "Completed" },
    ]
    return (
        <>
            <Navbar links={[{ label: "Orders" }]} />
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
                    <Button
                        onClick={() => {
                            setOrder(null)
                            addModal.openModal()
                        }}
                    >
                        <PlusIcon />
                        Add Order
                    </Button>
                </Group>

                {!!orderList.length && (
                    <CustomTable
                        columns={cols}
                        data={orderList}
                        isLoading={isFetching}
                    />
                )}

                {!orderList.length && !isFetching && (
                    <NoData>
                        <Button
                            onClick={() => {
                                setOrder(null)
                                addModal.openModal()
                            }}
                            variant="ghost"
                            className="text-primary"
                        >
                            <PlusIcon />
                            Add Order
                        </Button>
                    </NoData>
                )}
                <OrderDetailModal />
                <OrderAddEditModal />
                <OrderDeleteModal key="delete-order" />
            </Layout>
        </>
    )
}
