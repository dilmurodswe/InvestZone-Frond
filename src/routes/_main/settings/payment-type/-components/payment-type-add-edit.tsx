import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import UncontrolledInput from "@/components/form/uncontrolled-input"
import { CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
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

const EMPTY: Form = {
    name: "",
    opening_balance_uzs: "0",
    opening_balance_usd: "0",
    opening_balance_date: null,
}

function PaymentTypeAddEdit() {
    const { t } = useTranslation()
    const { closeModal } = useModal("add-payment-type")
    const { invalidateByExactMatch } = useRevalidate()
    const { paymentType } = usePaymentTypeStore()
    const { post, patch, isPending } = useRequest()
    const form = useForm<Form>({
        defaultValues: EMPTY,
        values:
            paymentType ?
                {
                    name: paymentType.name,
                    opening_balance_uzs: paymentType.opening_balance_uzs ?? "0",
                    opening_balance_usd: paymentType.opening_balance_usd ?? "0",
                    opening_balance_date:
                        paymentType.opening_balance_date ?? null,
                }
            :   undefined,
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

    const onSubmit = form.handleSubmit((raw) => {
        const vals = {
            ...raw,
            opening_balance_uzs: raw.opening_balance_uzs || "0",
            opening_balance_usd: raw.opening_balance_usd || "0",
            opening_balance_date: raw.opening_balance_date || null,
        }
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
            <div className="grid grid-cols-2 gap-3">
                <UncontrolledInput
                    methods={form}
                    name="opening_balance_uzs"
                    type="number"
                    label={t("cashFlow.openingBalanceUzs")}
                />
                <UncontrolledInput
                    methods={form}
                    name="opening_balance_usd"
                    type="number"
                    label={t("cashFlow.openingBalanceUsd")}
                />
            </div>
            <UncontrolledInput
                methods={form}
                name="opening_balance_date"
                type="date"
                label={t("cashFlow.openingBalanceDate")}
            />
            <FormAction
                submitName={paymentType ? t("common.save") : t("common.add")}
                loading={isPending}
            />
        </form>
    )
}
