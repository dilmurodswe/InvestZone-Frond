import { CustomTable } from "@/components/custom/custom-table"
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

export default function OrdersPage() {
    const { orderList, isFetching } = useOrdersQuery()
    const { setOrder } = useOrderStore()
    const addModal = useModal("add-order")
    const cols = getOrderCols()

    return (
        <>
            <Navbar links={[{ label: "Orders" }]} />
            <Layout>
                <Group className="flex justify-end mb-4">
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

                <OrderAddEditModal />
                <OrderDeleteModal key="delete-order" />
            </Layout>
        </>
    )
}
