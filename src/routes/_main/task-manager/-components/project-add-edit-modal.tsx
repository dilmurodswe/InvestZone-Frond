import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import { CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { ImagePlus, Loader2, X } from "lucide-react"
import { useRef, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { useAdminUsersQuery } from "../-hooks/use-admin-users-query"
import { useFileUpload } from "../-hooks/use-file-upload"
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

function ProjectAddEdit() {
    const { closeModal } = useModal("add-project")
    const { invalidateByExactMatch } = useRevalidate()
    const { project } = useProjectStore()
    const { post, patch, isPending } = useRequest()
    const { adminList } = useAdminUsersQuery()
    const { uploadFile, isUploading } = useFileUpload()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [previewUrl, setPreviewUrl] = useState<string>(
        project?.background ?? "",
    )

    const form = useForm<ProjectForm>({
        defaultValues: {
            name: "",
            background: "",
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

    const handleImageChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0]
        if (!file) return

        const localUrl = URL.createObjectURL(file)
        setPreviewUrl(localUrl)

        try {
            const result = await uploadFile(file)
            // "result.file" emas, "result.url" ishlat
            form.setValue("background", result.url)
            setPreviewUrl(result.url)
        } catch {
            toast.error("Image upload failed")
            setPreviewUrl(form.getValues("background"))
        }
    }

    const clearImage = () => {
        setPreviewUrl("")
        form.setValue("background", "")
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const selectedName = useWatch({ control: form.control, name: "name" })

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <CardTitle>{project ? "Edit Project" : "Create Project"}</CardTitle>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">
                    Project Name
                </label>
                <input
                    {...form.register("name", { required: "Name is required" })}
                    className="border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    placeholder="Enter project name"
                />
                {form.formState.errors.name && (
                    <p className="text-red-500 text-xs">
                        {form.formState.errors.name.message}
                    </p>
                )}
            </div>

            {/* Background image upload */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">
                    Cover Image
                </label>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                />

                {/* Preview / Upload area */}
                <div
                    className="relative h-36 rounded-xl border-2 border-dashed border-slate-200 overflow-hidden cursor-pointer group hover:border-primary/50 transition-colors"
                    onClick={() =>
                        !isUploading && fileInputRef.current?.click()
                    }
                >
                    {previewUrl ?
                        <>
                            <img
                                src={previewUrl}
                                alt="cover"
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay with name */}
                            <div className="absolute inset-0 bg-black/40 flex items-end p-3">
                                <span className="text-white font-bold text-base drop-shadow">
                                    {selectedName || "Project Preview"}
                                </span>
                            </div>
                            {/* Clear button */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    clearImage()
                                }}
                                className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </>
                    :   <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400 group-hover:text-primary transition-colors">
                            {isUploading ?
                                <Loader2 className="w-8 h-8 animate-spin" />
                            :   <>
                                    <ImagePlus className="w-8 h-8" />
                                    <span className="text-sm">
                                        Click to upload cover image
                                    </span>
                                </>
                            }
                        </div>
                    }

                    {/* Upload progress overlay */}
                    {isUploading && previewUrl && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-white" />
                        </div>
                    )}
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
                loading={isPending || isUploading}
            />
        </form>
    )
}
