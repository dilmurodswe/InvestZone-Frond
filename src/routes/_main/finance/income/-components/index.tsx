import { CustomTable } from "@/components/custom/custom-table"
import FilterSelect from "@/components/filter/filter-select"
import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import NoData from "@/components/no-data/nodata"
import Group from "@/components/semantic/group"
import { Button } from "@/components/ui/button"
import { useModal } from "@/hooks/use-modal"
import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useIncomesQuery } from "../-hooks/use-incomes-query"
import type { Income } from "../-types"
import IncomeAddEditModal from "./income-add-edit-modal"
import { getIncomeCols } from "./income-columns"
import IncomeDeleteModal from "./income-delete-modal"

export default function IncomePage() {
    const { incomeList, data, isFetching } = useIncomesQuery()
    const [selected, setSelected] = useState<Income | null>(null)
    const addModal = useModal("add-income")
    const deleteModal = useModal("delete-income")
    const { t } = useTranslation()

    const cols = getIncomeCols(
        (income) => {
            setSelected(income)
            addModal.openModal()
        },
        (income) => {
            setSelected(income)
            deleteModal.openModal()
        },
    )

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
                    <Button
                        onClick={() => {
                            setSelected(null)
                            addModal.openModal()
                        }}
                    >
                        <PlusIcon />
                        {t("common.addEntity", { entity: t("entity.income") })}
                    </Button>
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
                            onClick={() => {
                                setSelected(null)
                                addModal.openModal()
                            }}
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
