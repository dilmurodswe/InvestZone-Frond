import { useModal } from "@/hooks/use-modal"
import { format } from "date-fns"
import { Clock, Pencil, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useProjectStore } from "../-hooks/use-project-store"
import type { Project } from "../-types"
import ProjectDetailView from "./project-detail-view"

interface Props {
    project: Project
}

export default function ProjectCard({ project }: Props) {
    const [menuOpen, setMenuOpen] = useState(false)
    const [detailOpen, setDetailOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const { setProject } = useProjectStore()
    const editModal = useModal("add-project")
    const deleteModal = useModal("delete-project")

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node)
            ) {
                setMenuOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])
    console.log(menuOpen)

    return (
        <>
            <div
                className="rounded-2xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 group relative"
                onClick={() => setDetailOpen(true)}
                style={{ minHeight: 220 }}
            >
                {/* Background image or color */}
                <div className="absolute inset-0">
                    {(
                        project.background?.startsWith("http") ||
                        project.background?.startsWith("/")
                    ) ?
                        <img
                            src={project.background}
                            alt={project.name}
                            className="w-full h-full object-cover"
                        />
                    :   <div
                            className="w-full h-full"
                            style={{
                                backgroundColor:
                                    project.background || "#6366f1",
                            }}
                        />
                    }
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black/45" />
                </div>

                {/* Content */}
                <div
                    className="relative z-10 flex flex-col h-full p-4"
                    style={{ minHeight: 220 }}
                >
                    {/* Top row: title + members */}
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="text-white font-bold text-lg leading-tight drop-shadow flex-1">
                            {project.name}
                        </h3>
                        {/* Members avatars */}
                        <div className="flex flex-shrink-0">
                            {project.invited_users.slice(0, 3).map((user) => (
                                <div
                                    key={user.id}
                                    className="w-8 h-8 rounded-full border-2 border-white/60 flex items-center justify-center text-xs font-bold text-white bg-white/20 -ml-2 first:ml-0 backdrop-blur-sm"
                                    title={`${user.first_name} ${user.last_name}`}
                                >
                                    {user.first_name[0]}
                                </div>
                            ))}
                            {project.invited_users.length > 3 && (
                                <div className="w-8 h-8 rounded-full border-2 border-white/60 bg-black/40 flex items-center justify-center text-xs font-bold text-white -ml-2 backdrop-blur-sm">
                                    +{project.invited_users.length - 3}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Task counts */}
                    <div className="mt-3 flex flex-col gap-1.5">
                        <TaskCountRow label="Todo" value={project?.todo} />
                        <TaskCountRow
                            label="Processing"
                            value={project?.processing}
                        />
                        <TaskCountRow
                            label="Finished"
                            value={project?.finished}
                        />
                    </div>

                    {/* Bottom row: date + actions */}
                    <div className="mt-auto pt-3 flex items-center justify-between">
                        {/* Date */}
                        <span className="text-white/70 text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(project.created_at), "yyyy-MM-dd")}
                        </span>

                        {/* Actions */}
                        <div
                            ref={menuRef}
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Edit */}
                            <button
                                onClick={() => {
                                    setProject(project)
                                    editModal.openModal()
                                }}
                                className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                                title="Edit"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                                onClick={() => {
                                    setProject(project)
                                    deleteModal.openModal()
                                }}
                                className="w-8 h-8 rounded-lg bg-red-500/30 hover:bg-red-500/60 flex items-center justify-center text-white transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {detailOpen && (
                <ProjectDetailView
                    project={project}
                    onClose={() => setDetailOpen(false)}
                />
            )}
        </>
    )
}

function TaskCountRow({
    label,
    value,
}: {
    label: string
    value: number | undefined
}) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">{label}:</span>
            <span
                className={`text-sm font-semibold text-white ${value === 0 ? "text-white/50" : ""}`}
            >
                {value !== undefined ? `${value} vazifalar` : "—"}
            </span>
        </div>
    )
}
