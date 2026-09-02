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
import { useExpensesQuery } from "../-hooks/use-expenses-query"
import type { Expense } from "../-types"
import ExpenseAddEditModal from "./expense-add-edit-modal"
import { getExpenseCols } from "./expense-columns"
import ExpenseDeleteModal from "./expense-delete-modal"

export default function ExpensePage() {
    const { expenseList, data, isFetching } = useExpensesQuery()
    const [selected, setSelected] = useState<Expense | null>(null)
    const addModal = useModal("add-expense")
    const deleteModal = useModal("delete-expense")
    const { t } = useTranslation()

    const cols = getExpenseCols(
        (expense) => {
            setSelected(expense)
            addModal.openModal()
        },
        (expense) => {
            setSelected(expense)
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
        { id: "advance", name: t("salary.advance") },
        { id: "bonus", name: t("salary.bonus") },
        { id: "manual", name: t("salary.manual") },
    ]

    return (
        <>
            <Navbar links={[{ label: t("nav.expense") }]} />
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
                        {t("common.addEntity", { entity: t("entity.expense") })}
                    </Button>
                </Group>

                {!!expenseList.length && (
                    <CustomTable
                        columns={cols}
                        data={expenseList}
                        count={data?.count}
                        isLoading={isFetching}
                    />
                )}

                {!expenseList.length && !isFetching && (
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
                                entity: t("entity.expense"),
                            })}
                        </Button>
                    </NoData>
                )}

                <ExpenseAddEditModal expense={selected} />
                <ExpenseDeleteModal expense={selected} />
            </Layout>
        </>
    )
}
