import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import type { Expense } from "../-types"

interface Props {
    expense: Expense | null
}

export default function ExpenseDeleteModal({ expense }: Props) {
    return (
        <Modal modalKey="delete-expense">
            <ExpenseDelete expense={expense} />
        </Modal>
    )
}

function ExpenseDelete({ expense }: Props) {
    const { t } = useTranslation()
    const { closeModal } = useModal("delete-expense")
    const { invalidateByPatternMatch } = useRevalidate()
    const { remove, isPending } = useRequest()

    const onSuccess = () => {
        invalidateByPatternMatch([API.FINANCE.EXPENSE.INDEX])
        closeModal()
        toast.success("Expense deleted successfully")
    }

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (expense) {
            remove(
                API.FINANCE.EXPENSE.ID.INDEX.replace(
                    "{id}",
                    String(expense.id),
                ),
                undefined,
                { onSuccess },
            )
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>
                {t("common.deleteEntity", { entity: t("entity.expense") })}
            </CardTitle>
            <CardDescription>{t("common.deleteConfirm")}</CardDescription>
            <FormAction submitName={t("common.delete")} loading={isPending} />
        </form>
    )
}
