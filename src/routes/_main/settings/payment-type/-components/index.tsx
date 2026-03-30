import { CustomTable } from "@/components/custom/custom-table"
import NoData from "@/components/no-data/nodata"
import { Button } from "@/components/ui/button"
import { useModal } from "@/hooks/use-modal"
import { PlusIcon } from "lucide-react"
import { usePaymentTypeStore } from "../-hooks/use-payment-type-store"
import { usePaymentTypesQuery } from "../-hooks/use-payment-types-query"
import { getPaymentTypeCols } from "./get-payment-type-cols"
import PaymentTypeAddEditModal from "./payment-type-add-edit"
import PaymentTypeDeleteModal from "./payment-type-delete-modal"

export default function PaymentTypePage() {
    const { paymentTypeList, isFetching } = usePaymentTypesQuery()
    const { setPaymentType } = usePaymentTypeStore()
    const addModal = useModal("add-payment-type")
    const cols = getPaymentTypeCols()

    return (
        <>
            <div className="flex justify-between mb-0">
                <h2 className="text-xl font-bold">Payment Types</h2>
                <Button
                    onClick={() => {
                        setPaymentType(null)
                        addModal.openModal()
                    }}
                >
                    <PlusIcon />
                    Add Payment Type
                </Button>
            </div>

            {!!paymentTypeList.length && (
                <CustomTable
                    columns={cols}
                    data={paymentTypeList}
                    isLoading={isFetching}
                />
            )}

            {!paymentTypeList.length && !isFetching && (
                <NoData>
                    <Button
                        onClick={() => {
                            setPaymentType(null)
                            addModal.openModal()
                        }}
                        variant="ghost"
                        className="text-primary"
                    >
                        <PlusIcon />
                        Add Payment Type
                    </Button>
                </NoData>
            )}

            <PaymentTypeAddEditModal />
            <PaymentTypeDeleteModal key="delete-payment-type" />
        </>
    )
}
