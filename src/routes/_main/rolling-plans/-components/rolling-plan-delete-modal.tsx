import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { toast } from "sonner"
import { useRollingPlanStore } from "../-hooks/use-rolling-plan-store"

export default function RollingPlanDeleteModal() {
    return (
        <Modal modalKey="delete-rolling-plan">
            <RollingPlanDelete />
        </Modal>
    )
}

function RollingPlanDelete() {
    const { closeModal } = useModal("delete-rolling-plan")
    const { invalidateByExactMatch } = useRevalidate()
    const { rollingPlan } = useRollingPlanStore()
    const { remove, isPending } = useRequest()

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (rollingPlan) {
            remove(
                API.ROLLING_PLANS.ID.replace("{id}", String(rollingPlan.id)),
                undefined,
                {
                    onSuccess: () => {
                        invalidateByExactMatch([API.ROLLING_PLANS.INDEX])
                        closeModal()
                        toast.success("Deleted successfully")
                    },
                },
            )
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>Delete Rolling Plan</CardTitle>
            <CardDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                    rolling plan #{rollingPlan?.id}
                </span>
                ? This action cannot be undone.
            </CardDescription>
            <FormAction submitName="Delete" loading={isPending} />
        </form>
    )
}
