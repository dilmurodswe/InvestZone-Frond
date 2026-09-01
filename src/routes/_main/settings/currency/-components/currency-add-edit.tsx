import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import SelectField from "@/components/form/select-field"
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
import { currencyTypeOptions, type Currency } from "../-types"

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
        defaultValues: {
            currency: "",
            currency_type: undefined,
            current_rate: "",
        },
        values:
            currency ?
                {
                    currency: currency.currency,
                    currency_type: currency.currency_type,
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
            <CardTitle>
                {currency ?
                    t("common.editEntity", { entity: t("entity.currency") })
                :   t("common.addEntity", { entity: t("entity.currency") })}
            </CardTitle>
            <UncontrolledInput
                methods={form}
                name="currency"
                label="Currency name"
            />
            <SelectField
                methods={form}
                name="currency_type"
                options={currencyTypeOptions}
                label="Currency type"
                placeholder="Select currency type"
            />
            <UncontrolledInput
                methods={form}
                name="current_rate"
                label="Current rate"
            />
            <FormAction
                submitName={currency ? t("common.save") : t("common.add")}
                loading={isPending}
            />
        </form>
    )
}
