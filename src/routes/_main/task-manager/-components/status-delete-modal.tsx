import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { toast } from "sonner"
import { useStatusStore } from "../-hooks/use-status-store"

interface Props {
    projectId: number
}

export default function StatusDeleteModal({ projectId }: Props) {
    return (
        <Modal modalKey="delete-status">
            <StatusDelete projectId={projectId} />
        </Modal>
    )
}

function StatusDelete({ projectId }: Props) {
    const { closeModal } = useModal("delete-status")
    const { invalidateByExactMatch } = useRevalidate()
    const { status } = useStatusStore()
    const { remove, isPending } = useRequest()

    const onSuccess = () => {
        invalidateByExactMatch([
            API.TASK_MANAGER.PROJECT_TASKS.INDEX.replace(
                "{id}",
                String(projectId),
            ),
        ])
        closeModal()
        toast.success("Status deleted")
    }

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (status) {
            remove(
                API.TASK_MANAGER.STATUSES.ID.replace("{id}", String(status.id)),
                undefined,
                { onSuccess },
            )
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>Delete Status</CardTitle>
            <CardDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold">"{status?.name}"</span>? All
                tasks inside will be affected.
            </CardDescription>
            <FormAction submitName="Delete" loading={isPending} />
        </form>
    )
}
