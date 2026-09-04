import { CustomTable } from "@/components/custom/custom-table"
import FilterSelect from "@/components/filter/filter-select"
import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import NoData from "@/components/no-data/nodata"
import Group from "@/components/semantic/group"
import { Button } from "@/components/ui/button"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { PlusIcon, Trash2 } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { useIncomePrefillStore } from "../-hooks/use-income-prefill-store"
import { useIncomesQuery } from "../-hooks/use-incomes-query"
import type { Income } from "../-types"
import { useBulkSelect } from "../../-hooks/use-bulk-select"
import IncomeAddEditModal from "./income-add-edit-modal"
import { getIncomeCols } from "./income-columns"
import IncomeDeleteModal from "./income-delete-modal"

export default function IncomePage() {
    const { incomeList, data, isFetching } = useIncomesQuery()
    const [selected, setSelected] = useState<Income | null>(null)
    const addModal = useModal("add-income")
    const deleteModal = useModal("delete-income")
    const { t } = useTranslation()
    const bulk = useBulkSelect<Income>()
    const { removeAsync, isPending: deleting } = useRequest()
    const { invalidateByPatternMatch } = useRevalidate()
    const { setOrderId: setPrefillOrder } = useIncomePrefillStore()

    const openAdd = () => {
        setPrefillOrder(null)
        setSelected(null)
        addModal.openModal()
    }

    const cols = [
        bulk.selectionColumn(incomeList.map((e) => e.id)),
        ...getIncomeCols(
            (income) => {
                setSelected(income)
                addModal.openModal()
            },
            (income) => {
                setSelected(income)
                deleteModal.openModal()
            },
        ),
    ]

    const bulkDelete = async () => {
        const ids = [...bulk.selected]
        if (!ids.length || !window.confirm(t("common.deleteConfirm"))) return
        await Promise.all(
            ids.map((id) =>
                removeAsync(
                    API.FINANCE.INCOME.ID.INDEX.replace("{id}", String(id)),
                ),
            ),
        )
        invalidateByPatternMatch([API.FINANCE.INCOME.INDEX])
        bulk.clear()
        toast.success(t("common.deletedSuccessfully"))
    }

    const expenseOptions = [
        { id: "uzs", name: "UZS" },
        { id: "usd", name: "USD" },
    ]
    const paymentOptions = [
        { id: "naxt", name: "NAXT" },
        { id: "card", name: "CARD" },
        { id: "bank", name: "BANK" },
    ]
    const originOptions = [
        { id: "penalty", name: t("salary.penalty") },
        { id: "manual", name: t("salary.manual") },
    ]

    return (
        <>
            <Navbar links={[{ label: t("nav.income") }]} />
            <Layout>
                <Group className="flex justify-between mb-4">
                    <div className="flex gap-x-3">
                        <FilterSelect
                            filterKey="currency"
                            placeholder="Currency"
                            options={expenseOptions}
                        />
                        <FilterSelect
                            filterKey="payment_type"
                            placeholder="Payment Type"
                            options={paymentOptions}
                        />
                        <FilterSelect
                            filterKey="origin"
                            placeholder={t("salary.source")}
                            options={originOptions}
                        />
                    </div>
                    <div className="flex gap-2">
                        {bulk.selected.size > 0 && (
                            <Button
                                variant="destructive"
                                disabled={deleting}
                                onClick={bulkDelete}
                            >
                                <Trash2 className="size-4" />
                                {t("common.delete")} ({bulk.selected.size})
                            </Button>
                        )}
                        <Button onClick={openAdd}>
                            <PlusIcon />
                            {t("common.addEntity", {
                                entity: t("entity.income"),
                            })}
                        </Button>
                    </div>
                </Group>

                {!!incomeList.length && (
                    <CustomTable
                        columns={cols}
                        data={incomeList}
                        count={data?.count}
                        isLoading={isFetching}
                    />
                )}

                {!incomeList.length && !isFetching && (
                    <NoData>
                        <Button
                            onClick={openAdd}
                            variant="ghost"
                            className="text-primary"
                        >
                            <PlusIcon />
                            {t("common.addEntity", {
                                entity: t("entity.income"),
                            })}
                        </Button>
                    </NoData>
                )}

                <IncomeAddEditModal income={selected} />
                <IncomeDeleteModal income={selected} />
            </Layout>
        </>
    )
}
