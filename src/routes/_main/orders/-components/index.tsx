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
import { useOrderStore } from "../-hooks/use-order-store"
import { useOrdersQuery } from "../-hooks/use-orders-query"
import CreateDemandModal from "./create-demand-modal"
import { getOrderCols } from "./get-order-cols"
import OrderAddEditModal from "./order-add-edit"
import OrderDeleteModal from "./order-delete-modal"
import OrderDetailModal from "./order-detail-modal"
import OrderPrintModal from "./order-print-modal"
import { useOrderStatusOptions } from "./status-config"

export default function OrdersPage() {
    const { orderList, count, isFetching } = useOrdersQuery()
    const { setOrder } = useOrderStore()
    const addModal = useModal("add-order")
    const cols = getOrderCols()
    const { t } = useTranslation()
    const statusOptions = useOrderStatusOptions()

    const openAdd = () => {
        setOrder(null)
        addModal.openModal()
    }

    return (
        <>
            <Navbar links={[{ label: t("nav.sales") }]} />
            <Layout>
                <Group className="flex gap-4 flex-wrap justify-between">
                    <div className="flex flex-wrap gap-x-2 gap-y-4">
                        <FilterInput />
                        <FilterSelect
                            filterKey="status"
                            placeholder={t("table.status")}
                            options={statusOptions}
                            wrapperClassname="min-w-[220px]"
                            formatOptionLabel={(option) => (
                                <span
                                    className="inline-block px-2 py-1 rounded text-xs font-semibold"
                                    style={{
                                        backgroundColor: option.bg,
                                        color: option.color,
                                    }}
                                >
                                    {option.name}
                                </span>
                            )}
                        />
                    </div>
                    <Button onClick={openAdd}>
                        <PlusIcon />
                        {t("common.addEntity", { entity: t("entity.order") })}
                    </Button>
                </Group>

                {!!orderList.length && (
                    <CustomTable
                        columns={cols}
                        data={orderList}
                        count={count}
                        isLoading={isFetching}
                    />
                )}

                {!orderList.length && !isFetching && (
                    <NoData>
                        <Button
                            onClick={openAdd}
                            variant="ghost"
                            className="text-primary"
                        >
                            <PlusIcon />
                            {t("common.addEntity", {
                                entity: t("entity.order"),
                            })}
                        </Button>
                    </NoData>
                )}
                <OrderDetailModal />
                <OrderPrintModal />
                <OrderAddEditModal />
                <CreateDemandModal />
                <OrderDeleteModal key="delete-order" />
            </Layout>
        </>
    )
}
