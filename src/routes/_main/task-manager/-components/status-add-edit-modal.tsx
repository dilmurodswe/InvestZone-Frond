import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import { CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { useStatusStore } from "../-hooks/use-status-store"

interface Props {
    projectId: number
}

export default function StatusAddEditModal({ projectId }: Props) {
    return (
        <Modal modalKey="add-status" title={null}>
            <StatusAddEdit projectId={projectId} />
        </Modal>
    )
}

function StatusAddEdit({ projectId }: Props) {
    const { t } = useTranslation()
    const { closeModal } = useModal("add-status")
    const { invalidateByExactMatch } = useRevalidate()
    const { status } = useStatusStore()
    const { post, patch, isPending } = useRequest()

    const form = useForm<{ name: string }>({
        defaultValues: { name: "" },
        values: status ? { name: status.name } : undefined,
    })

    const onSuccess = () => {
        invalidateByExactMatch([
            API.TASK_MANAGER.PROJECT_TASKS.INDEX.replace(
                "{id}",
                String(projectId),
            ),
        ])
        closeModal()
        toast.success(status ? "Status updated" : "Status created")
    }

    const onSubmit = form.handleSubmit((vals) => {
        if (status) {
            patch(
                API.TASK_MANAGER.STATUSES.ID.replace("{id}", String(status.id)),
                { name: vals.name },
                { onSuccess },
            )
        } else {
            post(
                API.TASK_MANAGER.STATUSES.INDEX,
                { name: vals.name, project: projectId },
                { onSuccess },
            )
        }
    })

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>{status ? "Edit Status" : "Add Status"}</CardTitle>
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Status name</label>
                <input
                    {...form.register("name", { required: "Name is required" })}
                    className="border rounded px-3 py-2 text-sm"
                    placeholder="e.g. In Progress"
                />
                {form.formState.errors.name && (
                    <p className="text-red-500 text-xs">
                        {form.formState.errors.name.message}
                    </p>
                )}
            </div>
            <FormAction
                submitName={status ? t("common.save") : t("common.add")}
                loading={isPending}
            />
        </form>
    )
}
