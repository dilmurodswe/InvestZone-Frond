import { CustomTable } from "@/components/custom/custom-table"
import NoData from "@/components/no-data/nodata"
import { Button } from "@/components/ui/button"
import { useModal } from "@/hooks/use-modal"
import { PlusIcon } from "lucide-react"
import { useCurrenciesQuery } from "../-hooks/use-currencies-query"
import { useCurrencyStore } from "../-hooks/use-currency-store"
import CurrencyAddEditModal from "./currency-add-edit"
import CurrencyDeleteModal from "./currency-delete-modal"
import { getCurrencyCols } from "./get-currency-cols"

export default function CurrencyPage() {
    const { currencyList, isFetching } = useCurrenciesQuery()
    const { setCurrency } = useCurrencyStore()
    const addModal = useModal("add-currency")
    const cols = getCurrencyCols()

    return (
        <>
            <div className="flex justify-between mb-0 items-center">
                <h2 className="text-xl font-bold">Currencies</h2>
                <Button
                    onClick={() => {
                        setCurrency(null)
                        addModal.openModal()
                    }}
                >
                    <PlusIcon />
                    Add Currency
                </Button>
            </div>

            {!!currencyList.length && (
                <CustomTable
                    columns={cols}
                    data={currencyList}
                    isLoading={isFetching}
                />
            )}

            {!currencyList.length && !isFetching && (
                <NoData>
                    <Button
                        onClick={() => {
                            setCurrency(null)
                            addModal.openModal()
                        }}
                        variant="ghost"
                        className="text-primary"
                    >
                        <PlusIcon />
                        Add Currency
                    </Button>
                </NoData>
            )}

            <CurrencyAddEditModal />
            <CurrencyDeleteModal key="delete-currency" />
        </>
    )
}
