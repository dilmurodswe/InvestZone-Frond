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
import { useExpensesQuery } from "../-hooks/use-expenses-query"
import type { Expense } from "../-types"
import ExpenseAddEditModal from "./expense-add-edit-modal"
import { getExpenseCols } from "./expense-columns"
import ExpenseDeleteModal from "./expense-delete-modal"

export default function ExpensePage() {
    const { expenseList, isFetching } = useExpensesQuery()
    const [selected, setSelected] = useState<Expense | null>(null)
    const addModal = useModal("add-expense")
    const deleteModal = useModal("delete-expense")

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

    return (
        <>
            <Navbar links={[{ label: "Expense" }]} />
            <Layout>
                <Group className="flex justify-between mb-4">
                    <FilterSelect
                        filterKey="status"
                        placeholder="Payment Type"
                        options={expenseOptions}
                    />
                    <Button
                        onClick={() => {
                            setSelected(null)
                            addModal.openModal()
                        }}
                    >
                        <PlusIcon />
                        Add Expense
                    </Button>
                </Group>

                {!!expenseList.length && (
                    <CustomTable
                        columns={cols}
                        data={expenseList}
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
                            Add Expense
                        </Button>
                    </NoData>
                )}

                <ExpenseAddEditModal expense={selected} />
                <ExpenseDeleteModal expense={selected} />
            </Layout>
        </>
    )
}
