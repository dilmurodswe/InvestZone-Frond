import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import UncontrolledInput from "@/components/form/uncontrolled-input"
import { CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { usePaymentTypeStore } from "../-hooks/use-payment-type-store"
import type { PaymentType } from "../-types"

export default function PaymentTypeAddEditModal() {
    return (
        <Modal modalKey="add-payment-type" title={null}>
            <PaymentTypeAddEdit />
        </Modal>
    )
}

type Form = Omit<PaymentType, "id" | "is_active">

function PaymentTypeAddEdit() {
    const { closeModal } = useModal("add-payment-type")
    const { invalidateByExactMatch } = useRevalidate()
    const { paymentType } = usePaymentTypeStore()
    const { post, patch, isPending } = useRequest()
    const form = useForm<Form>({
        defaultValues: { name: "" },
        values: paymentType ? { name: paymentType.name } : undefined,
    })

    const onSuccess = () => {
        invalidateByExactMatch([API.SETTINGS.PAYMENT_TYPE.INDEX])
        closeModal()
        toast.success(
            paymentType ?
                "Updated successfully"
            :   "Payment type added successfully",
        )
    }

    const onSubmit = form.handleSubmit((vals) => {
        if (paymentType) {
            patch(
                API.SETTINGS.PAYMENT_TYPE.ID.INDEX.replace(
                    "{id}",
                    String(paymentType.id),
                ),
                vals,
                { onSuccess },
            )
        } else {
            post(
                API.SETTINGS.PAYMENT_TYPE.INDEX,
                { ...vals, is_active: true },
                { onSuccess },
            )
        }
    })

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>
                {paymentType ? "Edit Payment Type" : "Add Payment Type"}
            </CardTitle>
            <UncontrolledInput
                methods={form}
                name="name"
                label="Payment type name"
            />
            <FormAction
                submitName={paymentType ? "Save" : "Add"}
                loading={isPending}
            />
        </form>
    )
}
