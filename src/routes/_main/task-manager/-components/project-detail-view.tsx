import { useRequest } from "@/hooks/react-query/use-request"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { Loader2, UserPlus, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useAdminUsersQuery } from "../-hooks/use-admin-users-query"
import { useProjectQuery } from "../-hooks/use-project-query"
import { useProjectTasksQuery } from "../-hooks/use-project-tasks-query"
import { useStatusStore } from "../-hooks/use-status-store"
import type { Project } from "../-types"
import KanbanBoard from "./kanban-column"
import StatusAddEditModal from "./status-add-edit-modal"
import StatusDeleteModal from "./status-delete-modal"
import TaskAddEditModal from "./task-add-edit-modal"

interface Props {
    project: Project
    onClose: () => void
}

function MemberManager({
    projectId,
    onSuccess,
}: {
    projectId: number
    onSuccess: () => void
}) {
    const [open, setOpen] = useState(false)
    const { project } = useProjectQuery(projectId)
    const { adminList } = useAdminUsersQuery()
    const { patch, isPending } = useRequest()

    const currentMemberIds = (project?.invited_users ?? []).map(
        (u) => u.empl_id,
    )

    const toggle = (empId: number) => {
        const next =
            currentMemberIds.includes(empId) ?
                currentMemberIds.filter((id) => id !== empId)
            :   [...currentMemberIds, empId]

        patch(
            API.TASK_MANAGER.PROJECTS.ID.INDEX.replace(
                "{id}",
                String(projectId),
            ),
            { employees: next },
            {
                onSuccess: () => {
                    onSuccess()
                    toast.success("Members updated")
                },
            },
        )
    }

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                title="Manage members"
            >
                <UserPlus className="w-4 h-4" />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border z-50 min-w-[220px] max-h-64 overflow-y-auto">
                    <div className="px-3 py-2 border-b">
                        <p className="text-xs font-semibold text-slate-500">
                            Manage Members
                        </p>
                    </div>
                    {adminList.map((admin) => {
                        const isIn = currentMemberIds.includes(admin.id)
                        return (
                            <button
                                key={admin.id}
                                onClick={() => toggle(admin.id)}
                                disabled={isPending}
                                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-slate-50 text-sm text-left"
                            >
                                <div
                                    className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${isIn ? "bg-primary border-primary" : "border-slate-300"}`}
                                >
                                    {isIn && (
                                        <span className="text-white text-xs leading-none">
                                            ✓
                                        </span>
                                    )}
                                </div>
                                <span className="text-slate-700">
                                    {admin.first_name} {admin.last_name}
                                </span>
                                <span className="ml-auto text-xs text-slate-400 capitalize">
                                    {admin.role}
                                </span>
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default function ProjectDetailView({ project, onClose }: Props) {
    const { statusList, isFetching } = useProjectTasksQuery(project.id)
    const { project: fullProject, refetch: refetchProject } = useProjectQuery(
        project.id,
    )
    const { setStatus } = useStatusStore()
    const addStatusModal = useModal("add-status")

    const members = fullProject?.invited_users ?? project.invited_users

    return (
        // ⚠️ fixed inset-0 — bu sahifa refresh bo'lmaydi, faqat overlay
        <div
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: "#f1f5f9" }}
        >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 text-white bg-[#1e293b]">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">
                            {project.name}
                        </h1>
                        <p className="text-white/60 text-xs">
                            {members.length} members · {statusList.length}{" "}
                            columns
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Member avatars */}
                    <div className="flex">
                        {members.slice(0, 5).map((user) => (
                            <div
                                key={user.id}
                                className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-xs font-bold -ml-1 first:ml-0"
                                title={`${user.first_name} ${user.last_name}`}
                            >
                                {user.first_name[0]}
                            </div>
                        ))}
                        {members.length > 5 && (
                            <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-xs font-bold -ml-1">
                                +{members.length - 5}
                            </div>
                        )}
                    </div>

                    <MemberManager
                        projectId={project.id}
                        onSuccess={() => refetchProject()}
                    />
                </div>
            </div>

            {/* Board — horizontal scroll faqat shu div ichida */}
            <div className="flex-1 overflow-hidden">
                {isFetching ?
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                :   <KanbanBoard
                        key={statusList.map((s) => s.id).join(",")}
                        initialStatuses={statusList}
                        projectId={project.id}
                        members={members}
                        onAddColumn={() => {
                            setStatus(null)
                            addStatusModal.openModal()
                        }}
                    />
                }
            </div>

            <TaskAddEditModal
                projectId={project.id}
                statuses={statusList}
                members={members}
            />
            <StatusAddEditModal projectId={project.id} />
            <StatusDeleteModal projectId={project.id} />
        </div>
    )
}
