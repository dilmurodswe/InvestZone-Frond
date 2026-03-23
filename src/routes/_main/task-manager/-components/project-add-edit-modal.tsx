import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import { CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { useAdminUsersQuery } from "../-hooks/use-admin-users-query"
import { useProjectStore } from "../-hooks/use-project-store"
import type { ProjectForm } from "../-types"
import EmployeeMultiSelect from "./employee-multi-select"

export default function ProjectAddEditModal() {
    return (
        <Modal modalKey="add-project" title={null}>
            <ProjectAddEdit />
        </Modal>
    )
}

const BACKGROUND_COLORS = ["#6366f1", "#eab308", "#22c55e", "#1e293b"]

function ProjectAddEdit() {
    const { closeModal } = useModal("add-project")
    const { invalidateByExactMatch } = useRevalidate()
    const { project } = useProjectStore()
    const { post, patch, isPending } = useRequest()
    const { adminList } = useAdminUsersQuery()

    const form = useForm<ProjectForm>({
        defaultValues: {
            name: "",
            background: BACKGROUND_COLORS[0],
            employees: [],
        },
        values:
            project ?
                {
                    name: project.name,
                    background: project.background,
                    employees: project.invited_users.map((u) => u.empl_id),
                }
            :   undefined,
    })

    const onSuccess = () => {
        invalidateByExactMatch([API.TASK_MANAGER.PROJECTS.INDEX])
        closeModal()
        toast.success(project ? "Project updated" : "Project created")
    }

    const onSubmit = form.handleSubmit((vals) => {
        if (project) {
            patch(
                API.TASK_MANAGER.PROJECTS.ID.INDEX.replace(
                    "{id}",
                    String(project.id),
                ),
                vals,
                { onSuccess },
            )
        } else {
            post(API.TASK_MANAGER.PROJECTS.INDEX, vals, { onSuccess })
        }
    })

    const selectedBg = useWatch({ control: form.control, name: "background" })
    const selectedName = useWatch({ control: form.control, name: "name" })

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>{project ? "Edit Project" : "Create Project"}</CardTitle>

            {/* Name */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Project Name</label>
                <input
                    {...form.register("name", { required: "Name is required" })}
                    className="border rounded px-3 py-2 text-sm"
                    placeholder="Enter project name"
                />
                {form.formState.errors.name && (
                    <p className="text-red-500 text-xs">
                        {form.formState.errors.name.message}
                    </p>
                )}
            </div>

            {/* Background color picker */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Background Color</label>
                <div className="flex flex-wrap gap-2">
                    {BACKGROUND_COLORS.map((color) => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => form.setValue("background", color)}
                            className="w-8 h-8 rounded-full border-2 transition-all"
                            style={{
                                backgroundColor: color,
                                borderColor:
                                    selectedBg === color ? "#000" : (
                                        "transparent"
                                    ),
                                transform:
                                    selectedBg === color ? "scale(1.15)" : (
                                        "scale(1)"
                                    ),
                            }}
                        />
                    ))}
                </div>
                {/* Preview */}
                <div
                    className="h-12 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: selectedBg }}
                >
                    {selectedName || "Project Preview"}
                </div>
            </div>

            {/* Employees */}
            <Controller
                control={form.control}
                name="employees"
                render={({ field }) => (
                    <EmployeeMultiSelect
                        options={adminList}
                        value={field.value}
                        onChange={field.onChange}
                        label="Employees"
                        error={form.formState.errors.employees?.message}
                    />
                )}
            />

            <FormAction
                submitName={project ? "Save" : "Create"}
                loading={isPending}
            />
        </form>
    )
}
