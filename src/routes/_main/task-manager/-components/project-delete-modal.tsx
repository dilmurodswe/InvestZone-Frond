import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { toast } from "sonner"
import { useProjectStore } from "../-hooks/use-project-store"

export default function ProjectDeleteModal() {
    return (
        <Modal modalKey="delete-project">
            <ProjectDelete />
        </Modal>
    )
}

function ProjectDelete() {
    const { closeModal } = useModal("delete-project")
    const { invalidateByExactMatch } = useRevalidate()
    const { project } = useProjectStore()
    const { remove, isPending } = useRequest()

    const onSuccess = () => {
        invalidateByExactMatch([API.TASK_MANAGER.PROJECTS.INDEX])
        closeModal()
        toast.success("Project deleted")
    }

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (project) {
            remove(
                API.TASK_MANAGER.PROJECTS.ID.INDEX.replace(
                    "{id}",
                    String(project.id),
                ),
                undefined,
                { onSuccess },
            )
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>Delete Project</CardTitle>
            <CardDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold">{project?.name}</span>? This
                action cannot be undone.
            </CardDescription>
            <FormAction submitName="Delete" loading={isPending} />
        </form>
    )
}
