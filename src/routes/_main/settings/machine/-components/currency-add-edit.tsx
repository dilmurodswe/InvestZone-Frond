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
    const { t } = useTranslation()
    const { closeModal } = useModal("add-currency")
    const { invalidateByExactMatch } = useRevalidate()
    const { currency } = useCurrencyStore()
    const { post, patch, isPending } = useRequest()
    const form = useForm<Form>({
        defaultValues: { name: "" },
        values:
            currency ?
                {
                    name: currency.name,
                }
            :   undefined,
    })

    const onSuccess = () => {
        invalidateByExactMatch([API.SETTINGS.MACHINE.INDEX])
        closeModal()
        toast.success(
            currency ? "Updated successfully" : "Machine added successfully",
        )
    }

    const onSubmit = form.handleSubmit((vals) => {
        if (currency) {
            patch(
                API.SETTINGS.MACHINE.ID.INDEX.replace(
                    "{id}",
                    String(currency.id),
                ),
                vals,
                { onSuccess },
            )
        } else {
            post(
                API.SETTINGS.MACHINE.INDEX,
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
                name="name"
                label="Machine name"
            />

            <FormAction
                submitName={currency ? t("common.save") : t("common.add")}
                loading={isPending}
            />
        </form>
    )
}
