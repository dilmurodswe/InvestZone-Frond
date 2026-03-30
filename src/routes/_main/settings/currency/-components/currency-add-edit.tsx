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
import { useCurrencyStore } from "../-hooks/use-currency-store"
import type { Currency } from "../-types"

export default function CurrencyAddEditModal() {
    return (
        <Modal modalKey="add-currency" title={null}>
            <CurrencyAddEdit />
        </Modal>
    )
}

type Form = Omit<Currency, "id" | "is_active">

function CurrencyAddEdit() {
    const { closeModal } = useModal("add-currency")
    const { invalidateByExactMatch } = useRevalidate()
    const { currency } = useCurrencyStore()
    const { post, patch, isPending } = useRequest()
    const form = useForm<Form>({
        defaultValues: { currency: "", current_rate: "" },
        values:
            currency ?
                {
                    currency: currency.currency,
                    current_rate: currency.current_rate,
                }
            :   undefined,
    })

    const onSuccess = () => {
        invalidateByExactMatch([API.SETTINGS.CURRENCY.INDEX])
        closeModal()
        toast.success(
            currency ? "Updated successfully" : "Currency added successfully",
        )
    }

    const onSubmit = form.handleSubmit((vals) => {
        if (currency) {
            patch(
                API.SETTINGS.CURRENCY.ID.INDEX.replace(
                    "{id}",
                    String(currency.id),
                ),
                vals,
                { onSuccess },
            )
        } else {
            post(
                API.SETTINGS.CURRENCY.INDEX,
                { ...vals, is_active: true },
                { onSuccess },
            )
        }
    })

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>{currency ? "Edit Currency" : "Add Currency"}</CardTitle>
            <UncontrolledInput
                methods={form}
                name="currency"
                label="Currency name"
            />
            <UncontrolledInput
                methods={form}
                name="current_rate"
                label="Current rate"
            />
            <FormAction
                submitName={currency ? "Save" : "Add"}
                loading={isPending}
            />
        </form>
    )
}
