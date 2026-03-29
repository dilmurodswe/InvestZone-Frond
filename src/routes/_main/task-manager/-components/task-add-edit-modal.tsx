import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import { Calendar } from "@/components/ui/calendar"
import { CardTitle } from "@/components/ui/card"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import type { Admin } from "@/routes/_main/admins/-types"
import { format } from "date-fns"
import {
    Calendar as CalendarIcon,
    CheckSquare,
    Plus,
    Square,
    Trash2,
} from "lucide-react"
import { useState } from "react"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { useTaskStore } from "../-hooks/use-task-store"
import type { InvitedUser, KanbanStatus, TaskForm } from "../-types"
import EmployeeMultiSelect from "./employee-multi-select"

interface Props {
    projectId: number
    statuses: KanbanStatus[]
    members: InvitedUser[]
}

export default function TaskAddEditModal(props: Props) {
    return (
        <Modal modalKey="add-task" title={null}>
            <TaskAddEdit {...props} />
        </Modal>
    )
}

const PRIORITY_OPTIONS = [
    { id: 1, label: "Low", color: "#22c55e" },
    { id: 2, label: "Medium", color: "#eab308" },
    { id: 3, label: "High", color: "#ef4444" },
] as const

function TaskAddEdit({ projectId, statuses, members }: Props) {
    const { closeModal } = useModal("add-task")
    const { invalidateByExactMatch } = useRevalidate()
    const { task, selectedStatusId } = useTaskStore()
    const { post, patch, isPending } = useRequest()

    // Convert InvitedUser[] to Admin-like shape for EmployeeMultiSelect
    const adminLikeMembers = members.map((m) => ({
        id: m.empl_id,
        first_name: m.first_name,
        last_name: m.last_name,
        phone_number: "",
        role: "admin" as const,
        is_active: true,
        date_joined: "",
        employee_code: null,
    })) as Admin[]

    const form = useForm<TaskForm>({
        defaultValues: {
            title: "",
            desc: "",
            status: selectedStatusId ?? statuses[0]?.id ?? 0,
            users: [],
            order: 1,
            deadline: "",
            priority: 2,
            subtasks: [],
        },
        values:
            task ?
                {
                    title: task.title,
                    desc: task.desc,
                    status: task.status_id,
                    users: task.users_data.map((u) => u.id),
                    order: task.order,
                    deadline: task.deadline ? task.deadline.slice(0, 16) : "",
                    priority: task.priority,
                    subtasks: [],
                }
            :   undefined,
    })
    const [deadlineOpen, setDeadlineOpen] = useState(false)
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "subtasks",
    })

    const onSuccess = () => {
        invalidateByExactMatch([
            API.TASK_MANAGER.PROJECT_TASKS.INDEX.replace(
                "{id}",
                String(projectId),
            ),
        ])
        closeModal()
        toast.success(task ? "Task updated" : "Task created")
    }

    const onSubmit = form.handleSubmit((vals) => {
        const payload = {
            ...vals,
            deadline:
                vals.deadline ?
                    new Date(vals.deadline).toISOString()
                :   undefined,
        }
        if (task) {
            patch(
                API.TASK_MANAGER.TASKS.ID.replace("{id}", String(task.id)),
                payload,
                { onSuccess },
            )
        } else {
            post(API.TASK_MANAGER.TASKS.INDEX, payload, { onSuccess })
        }
    })
    const priority = useWatch({ control: form.control, name: "priority" })
    // const priority = form.watch("priority")

    return (
        <form
            onSubmit={onSubmit}
            className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-1"
        >
            <CardTitle>{task ? "Edit Task" : "Add Task"}</CardTitle>

            {/* Title */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Title</label>
                <input
                    {...form.register("title", {
                        required: "Title is required",
                    })}
                    className="border rounded px-3 py-2 text-sm"
                    placeholder="Task title"
                />
                {form.formState.errors.title && (
                    <p className="text-red-500 text-xs">
                        {form.formState.errors.title.message}
                    </p>
                )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Description</label>
                <textarea
                    {...form.register("desc")}
                    rows={3}
                    className="border rounded px-3 py-2 text-sm resize-none"
                    placeholder="Task description..."
                />
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Status</label>
                <select
                    {...form.register("status", { valueAsNumber: true })}
                    className="border rounded px-3 py-2 text-sm"
                >
                    {statuses.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Priority */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Priority</label>
                <div className="flex gap-2">
                    {PRIORITY_OPTIONS.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => form.setValue("priority", p.id)}
                            className="flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-all"
                            style={{
                                borderColor:
                                    priority === p.id ? p.color : "#e2e8f0",
                                backgroundColor:
                                    priority === p.id ?
                                        p.color + "20"
                                    :   "white",
                                color: priority === p.id ? p.color : "#94a3b8",
                            }}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Deadline */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Deadline</label>
                <Controller
                    control={form.control}
                    name="deadline"
                    render={({ field }) => {
                        const date =
                            field.value ? new Date(field.value) : undefined
                        return (
                            <Popover
                                open={deadlineOpen}
                                onOpenChange={setDeadlineOpen}
                            >
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 border rounded px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
                                    >
                                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                        <span
                                            className={
                                                date ? "" : (
                                                    "text-muted-foreground"
                                                )
                                            }
                                        >
                                            {date ?
                                                format(date, "dd MMM yyyy")
                                            :   "Pick a date"}
                                        </span>
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(d) => {
                                            field.onChange(
                                                d ? d.toISOString() : "",
                                            )
                                            setDeadlineOpen(false)
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        )
                    }}
                />
            </div>

            {/* Users */}
            <Controller
                control={form.control}
                name="users"
                render={({ field }) => (
                    <EmployeeMultiSelect
                        options={adminLikeMembers}
                        value={field.value}
                        onChange={field.onChange}
                        label="Assignees"
                    />
                )}
            />

            {/* Subtasks */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Subtasks</label>
                    <button
                        type="button"
                        onClick={() => append({ title: "", finished: false })}
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                        <Plus className="w-3 h-3" /> Add subtask
                    </button>
                </div>
                <div className="flex flex-col gap-2">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                            <Controller
                                control={form.control}
                                name={`subtasks.${index}.finished`}
                                render={({ field: f }) => (
                                    <button
                                        type="button"
                                        onClick={() => f.onChange(!f.value)}
                                        className="text-slate-400 hover:text-primary flex-shrink-0"
                                    >
                                        {f.value ?
                                            <CheckSquare className="w-4 h-4 text-primary" />
                                        :   <Square className="w-4 h-4" />}
                                    </button>
                                )}
                            />
                            <input
                                {...form.register(`subtasks.${index}.title`, {
                                    required: true,
                                })}
                                className="flex-1 border rounded px-2 py-1.5 text-sm"
                                placeholder="Subtask title"
                            />
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="text-red-400 hover:text-red-600 flex-shrink-0"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <FormAction
                submitName={task ? "Save" : "Create"}
                loading={isPending}
            />
        </form>
    )
}
