import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useGet } from "@/hooks/react-query/use-get"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { API } from "@/lib/constants/api-endpoints"
import { format } from "date-fns"
import {
    Calendar,
    Check,
    CheckSquare,
    ChevronDown,
    Clock,
    Flag,
    Pencil,
    Plus,
    Square,
    Trash2,
    User,
    X,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import type { InvitedUser, KanbanStatus, Subtask, Task } from "../-types"

interface TaskDetailProps {
    task: Task
    projectId: number
    statuses: KanbanStatus[]
    members: InvitedUser[]
    onClose: () => void
    onDeleted?: () => void
}

interface FullTask extends Task {
    subtasks?: (Subtask & { id: number })[]
}

const PRIORITY_MAP = {
    1: { label: "Low", color: "#22c55e" },
    2: { label: "Medium", color: "#eab308" },
    3: { label: "High", color: "#ef4444" },
} as const

// ─── Date Picker ──────────────────────────────────────────────────────────────
function DatePickerButton({
    value,
    onChange,
}: {
    value: string | undefined
    onChange: (iso: string | undefined) => void
}) {
    const [open, setOpen] = useState(false)

    return (
        <div className="flex items-center gap-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 transition-colors rounded-lg px-3 py-2"
                    >
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700">
                            {value ?
                                format(new Date(value), "dd MMM yyyy")
                            :   "Set deadline"}
                        </span>
                        <Pencil className="w-3 h-3 text-slate-400" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                        mode="single"
                        selected={value ? new Date(value) : undefined}
                        onSelect={(date) => {
                            onChange(date ? date.toISOString() : undefined)
                            setOpen(false)
                        }}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
            {value && (
                <button
                    type="button"
                    onClick={() => onChange(undefined)}
                    className="w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    )
}

// ─── Status Dropdown ──────────────────────────────────────────────────────────
function StatusDropdown({
    statuses,
    currentId,
    onChange,
}: {
    statuses: KanbanStatus[]
    currentId: number
    onChange: (id: number) => void
}) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const current = statuses.find((s) => s.id === currentId)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node))
                setOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
            >
                {current?.name ?? "Status"}
                <ChevronDown className="w-3 h-3" />
            </button>
            {open && (
                <div className="absolute left-0 top-full mt-1 bg-white border rounded-xl shadow-lg z-50 min-w-[160px] overflow-hidden">
                    {statuses.map((s) => (
                        <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                                onChange(s.id)
                                setOpen(false)
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-slate-50 text-sm text-left"
                        >
                            <div
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                    s.id === currentId ?
                                        "border-primary bg-primary"
                                    :   "border-slate-300"
                                }`}
                            >
                                {s.id === currentId && (
                                    <Check className="w-2.5 h-2.5 text-white" />
                                )}
                            </div>
                            {s.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Assignee Dropdown ────────────────────────────────────────────────────────
function AssigneeDropdown({
    members,
    assignedIds,
    onToggle,
}: {
    members: InvitedUser[]
    assignedIds: number[]
    onToggle: (id: number) => void
}) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node))
                setOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 rounded-full px-3 py-1 text-xs text-slate-500 transition-colors"
            >
                <Plus className="w-3 h-3" />
                <ChevronDown className="w-3 h-3" />
            </button>
            {open && (
                <div className="absolute left-0 top-full mt-1 bg-white border rounded-xl shadow-lg z-50 min-w-[180px] overflow-hidden">
                    {members.map((m) => {
                        const isAssigned = assignedIds.includes(m.empl_id)
                        return (
                            <button
                                key={m.empl_id}
                                type="button"
                                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-slate-50 text-sm"
                                onClick={() => onToggle(m.empl_id)}
                            >
                                <div
                                    className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                        isAssigned ?
                                            "bg-primary border-primary"
                                        :   "border-slate-300"
                                    }`}
                                >
                                    {isAssigned && (
                                        <Check className="w-2.5 h-2.5 text-white" />
                                    )}
                                </div>
                                {m.first_name} {m.last_name}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({
    onConfirm,
    onCancel,
    isPending,
}: {
    onConfirm: () => void
    onCancel: () => void
    isPending: boolean
}) {
    const { t } = useTranslation()
    return (
        <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <div className="bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-xs w-full">
                <h3 className="font-bold text-slate-800 text-base mb-1">
                    Delete Task?
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                    This action cannot be undone.
                </p>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-2 rounded-lg border text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        {t("common.cancel")}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isPending}
                        className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {t("common.delete")}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TaskDetailPage({
    task,
    projectId,
    statuses,
    members,
    onClose,
    onDeleted,
}: TaskDetailProps) {
    const { patch, remove, isPending } = useRequest()
    const { invalidateByExactMatch } = useRevalidate()

    const { data: fullTask, refetch } = useGet<FullTask>(
        API.TASK_MANAGER.TASKS.ID.replace("{id}", String(task.id)),
    )

    const [newSubtask, setNewSubtask] = useState("")
    const [editingField, setEditingField] = useState<string | null>(null)
    const [localTitle, setLocalTitle] = useState(task.title)
    const [localDesc, setLocalDesc] = useState(task.desc)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    useEffect(() => {
        setLocalTitle(task.title)
        setLocalDesc(task.desc)
    }, [task])

    const invalidate = () => {
        invalidateByExactMatch([
            API.TASK_MANAGER.PROJECT_TASKS.INDEX.replace(
                "{id}",
                String(projectId),
            ),
        ])
        refetch()
    }

    // optimistic update — loader ko'rsatmaydi
    const patchTask = (data: Record<string, unknown>) => {
        patch(
            API.TASK_MANAGER.TASKS.ID.replace("{id}", String(task.id)),
            data,
            { onSuccess: () => invalidate() },
        )
    }

    const patchTaskWithMsg = (data: Record<string, unknown>, msg: string) => {
        patch(
            API.TASK_MANAGER.TASKS.ID.replace("{id}", String(task.id)),
            data,
            {
                onSuccess: () => {
                    invalidate()
                    toast.success(msg)
                },
            },
        )
    }

    const handleDelete = () => {
        remove(
            API.TASK_MANAGER.TASKS.ID.replace("{id}", String(task.id)),
            undefined,
            {
                onSuccess: () => {
                    invalidate()
                    toast.success("Task deleted")
                    onDeleted?.()
                    onClose()
                },
            },
        )
    }

    const toggleSubtask = (subtask: Subtask & { id: number }) => {
        patchTask({
            subtasks: [
                {
                    id: subtask.id,
                    title: subtask.title,
                    finished: !subtask.finished,
                },
            ],
        })
    }

    const deleteSubtask = (id: number) => {
        patchTaskWithMsg({ deleted_subtasks: [id] }, "Subtask deleted")
    }

    const addSubtask = () => {
        if (!newSubtask.trim()) return
        patchTaskWithMsg(
            { subtasks: [{ title: newSubtask.trim(), finished: false }] },
            "Subtask added",
        )
        setNewSubtask("")
    }

    const saveTitle = () => {
        if (localTitle.trim() && localTitle !== task.title) {
            patchTask({ title: localTitle.trim() })
        }
        setEditingField(null)
    }

    const saveDesc = () => {
        if (localDesc !== task.desc) {
            patchTask({ desc: localDesc })
        }
        setEditingField(null)
    }

    const subtasks = fullTask?.subtasks ?? []
    const finishedCount = subtasks.filter((s) => s.finished).length

    return (
        <div className="fixed inset-0 z-[60] flex">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="relative ml-auto w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden">
                {/* Delete confirm overlay */}
                {showDeleteConfirm && (
                    <DeleteConfirm
                        onConfirm={handleDelete}
                        onCancel={() => setShowDeleteConfirm(false)}
                        isPending={isPending}
                    />
                )}

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b">
                    <div className="flex items-center gap-1.5">
                        <StatusDropdown
                            statuses={statuses}
                            currentId={task.status_id}
                            onChange={(id) => patchTask({ status: id })}
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
                    {/* Title */}
                    <div>
                        {editingField === "title" ?
                            <input
                                autoFocus
                                value={localTitle}
                                onChange={(e) => setLocalTitle(e.target.value)}
                                onBlur={saveTitle}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && saveTitle()
                                }
                                className="w-full text-xl font-bold border-b-2 border-primary outline-none pb-1 bg-transparent"
                            />
                        :   <h2
                                className="text-xl font-bold text-slate-800 cursor-pointer hover:text-primary flex items-center gap-2 group"
                                onClick={() => setEditingField("title")}
                            >
                                {task.title}
                                <Pencil className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity" />
                            </h2>
                        }
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                            Description
                        </label>
                        {editingField === "desc" ?
                            <textarea
                                autoFocus
                                value={localDesc}
                                onChange={(e) => setLocalDesc(e.target.value)}
                                onBlur={saveDesc}
                                rows={4}
                                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm resize-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                            />
                        :   <p
                                className="mt-1 text-sm text-slate-600 cursor-pointer hover:bg-slate-50 rounded-lg p-2 min-h-[40px] transition-colors"
                                onClick={() => setEditingField("desc")}
                            >
                                {task.desc || (
                                    <span className="text-slate-300 italic">
                                        Click to add description...
                                    </span>
                                )}
                            </p>
                        }
                    </div>

                    {/* Deadline */}
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1 mb-1.5">
                            <Clock className="w-3 h-3" /> Deadline
                        </label>
                        <DatePickerButton
                            value={task.deadline}
                            onChange={(iso) => {
                                patchTask({ deadline: iso ?? null })
                            }}
                        />
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1 mb-1.5">
                            <Flag className="w-3 h-3" /> Priority
                        </label>
                        <div className="flex gap-2">
                            {([1, 2, 3] as const).map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => patchTask({ priority: p })}
                                    className="flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-all"
                                    style={{
                                        borderColor:
                                            task.priority === p ?
                                                PRIORITY_MAP[p].color
                                            :   "#e2e8f0",
                                        backgroundColor:
                                            task.priority === p ?
                                                PRIORITY_MAP[p].color + "15"
                                            :   "white",
                                        color:
                                            task.priority === p ?
                                                PRIORITY_MAP[p].color
                                            :   "#94a3b8",
                                    }}
                                >
                                    {PRIORITY_MAP[p].label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Assignees */}
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1 mb-1.5">
                            <User className="w-3 h-3" /> Assignees
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {task.users_data.map((u) => (
                                <div
                                    key={u.id}
                                    className="flex items-center gap-1.5 bg-slate-100 rounded-full px-3 py-1"
                                >
                                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                        {u.full_name[0]}
                                    </div>
                                    <span className="text-xs text-slate-700">
                                        {u.full_name}
                                    </span>
                                </div>
                            ))}
                            <AssigneeDropdown
                                members={members}
                                assignedIds={task.users_data.map((u) => u.id)}
                                onToggle={(empId) => {
                                    const current = task.users_data.map(
                                        (u) => u.id,
                                    )
                                    const isAssigned = current.includes(empId)
                                    const next =
                                        isAssigned ?
                                            current.filter((id) => id !== empId)
                                        :   [...current, empId]
                                    patchTask({ users: next })
                                }}
                            />
                        </div>
                    </div>

                    {/* Subtasks */}
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5 block">
                            Subtasks{" "}
                            {subtasks.length > 0 && (
                                <span className="text-primary">
                                    {finishedCount}/{subtasks.length}
                                </span>
                            )}
                        </label>

                        {subtasks.length > 0 && (
                            <div className="mt-1 mb-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-300"
                                    style={{
                                        width: `${(finishedCount / subtasks.length) * 100}%`,
                                    }}
                                />
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                            {subtasks.map((s) => (
                                <div
                                    key={s.id}
                                    className="flex items-center gap-2 group bg-slate-50 rounded-lg px-2 py-1.5"
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleSubtask(s)}
                                        className="flex-shrink-0"
                                        disabled={isPending}
                                    >
                                        {s.finished ?
                                            <CheckSquare className="w-4 h-4 text-primary" />
                                        :   <Square className="w-4 h-4 text-slate-400" />
                                        }
                                    </button>
                                    <span
                                        className={`flex-1 text-sm ${
                                            s.finished ?
                                                "line-through text-slate-400"
                                            :   "text-slate-700"
                                        }`}
                                    >
                                        {s.title}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => deleteSubtask(s.id!)}
                                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
                                        disabled={isPending}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}

                            {/* Add subtask */}
                            <div className="flex items-center gap-2 mt-1">
                                <input
                                    value={newSubtask}
                                    onChange={(e) =>
                                        setNewSubtask(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === "Enter" && addSubtask()
                                    }
                                    className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                                    placeholder="Add subtask..."
                                />
                                <button
                                    type="button"
                                    onClick={addSubtask}
                                    disabled={!newSubtask.trim() || isPending}
                                    className="bg-primary text-white rounded-lg px-3 py-2 text-sm disabled:opacity-40 hover:bg-primary/90 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
