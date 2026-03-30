import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { toast } from "sonner"
import { usePaymentTypeStore } from "../-hooks/use-payment-type-store"

export default function PaymentTypeDeleteModal() {
    return (
        <Modal modalKey="delete-payment-type">
            <PaymentTypeDelete />
        </Modal>
    )
}

function PaymentTypeDelete() {
    const { closeModal } = useModal("delete-payment-type")
    const { invalidateByExactMatch } = useRevalidate()
    const { paymentType } = usePaymentTypeStore()
    const { remove, isPending } = useRequest()

    const onSuccess = () => {
        invalidateByExactMatch([API.SETTINGS.PAYMENT_TYPE.INDEX])
        closeModal()
        toast.success("Payment type deleted successfully")
    }

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (paymentType) {
            remove(
                API.SETTINGS.PAYMENT_TYPE.ID.INDEX.replace(
                    "{id}",
                    String(paymentType.id),
                ),
                undefined,
                { onSuccess },
            )
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>Delete Payment Type</CardTitle>
            <CardDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold">{paymentType?.name}</span>? This
                action cannot be undone.
            </CardDescription>
            <FormAction submitName="Delete" loading={isPending} />
        </form>
    )
}
