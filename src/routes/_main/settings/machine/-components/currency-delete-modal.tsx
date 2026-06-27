import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { useCurrencyStore } from "../-hooks/use-currency-store"

export default function CurrencyDeleteModal() {
    return (
        <Modal modalKey="delete-currency">
            <CurrencyDelete />
        </Modal>
    )
}

function CurrencyDelete() {
    const { t } = useTranslation()
    const { closeModal } = useModal("delete-currency")
    const { invalidateByExactMatch } = useRevalidate()
    const { currency } = useCurrencyStore()
    const { remove, isPending } = useRequest()

    const onSuccess = () => {
        invalidateByExactMatch([API.SETTINGS.CURRENCY.INDEX])
        closeModal()
        toast.success("Currency deleted successfully")
    }

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (currency) {
            remove(
                API.SETTINGS.CURRENCY.ID.INDEX.replace(
                    "{id}",
                    String(currency.id),
                ),
                undefined,
                { onSuccess },
            )
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>Delete Currency</CardTitle>
            <CardDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold">{currency?.name}</span>? This
                action cannot be undone.
            </CardDescription>
            <FormAction submitName={t("common.delete")} loading={isPending} />
        </form>
    )
}
