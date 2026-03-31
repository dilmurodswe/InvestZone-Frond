import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { toast } from "sonner"
import type { Income } from "../-types"

interface Props {
    income: Income | null
}

export default function IncomeDeleteModal({ income }: Props) {
    return (
        <Modal modalKey="delete-income">
            <IncomeDelete income={income} />
        </Modal>
    )
}

function IncomeDelete({ income }: Props) {
    const { closeModal } = useModal("delete-income")
    const { invalidateByPatternMatch } = useRevalidate()
    const { remove, isPending } = useRequest()

    const onSuccess = () => {
        invalidateByPatternMatch([API.FINANCE.INCOME.INDEX])
        closeModal()
        toast.success("Income deleted successfully")
    }

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (income) {
            remove(
                API.FINANCE.INCOME.ID.INDEX.replace("{id}", String(income.id)),
                undefined,
                { onSuccess },
            )
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>Delete Income</CardTitle>
            <CardDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold">"{income?.name}"</span>? This
                action cannot be undone.
            </CardDescription>
            <FormAction submitName="Delete" loading={isPending} />
        </form>
    )
}
