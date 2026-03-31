import { CustomTable } from "@/components/custom/custom-table"
import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import NoData from "@/components/no-data/nodata"
import Group from "@/components/semantic/group"
import { Button } from "@/components/ui/button"
import { useModal } from "@/hooks/use-modal"
import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { useIncomesQuery } from "../-hooks/use-incomes-query"
import type { Income } from "../-types"
import IncomeAddEditModal from "./income-add-edit-modal"
import { getIncomeCols } from "./income-columns"
import IncomeDeleteModal from "./income-delete-modal"

export default function IncomePage() {
    const { incomeList, isFetching } = useIncomesQuery()
    const [selected, setSelected] = useState<Income | null>(null)
    const addModal = useModal("add-income")
    const deleteModal = useModal("delete-income")

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

    return (
        <>
            <Navbar links={[{ label: "Income" }]} />
            <Layout>
                <Group className="flex justify-end mb-4">
                    <Button
                        onClick={() => {
                            setSelected(null)
                            addModal.openModal()
                        }}
                    >
                        <PlusIcon />
                        Add Income
                    </Button>
                </Group>

                {!!incomeList.length && (
                    <CustomTable
                        columns={cols}
                        data={incomeList}
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
                            Add Income
                        </Button>
                    </NoData>
                )}

                <IncomeAddEditModal income={selected} />
                <IncomeDeleteModal income={selected} />
            </Layout>
        </>
    )
}
