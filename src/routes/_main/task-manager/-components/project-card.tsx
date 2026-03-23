import { useModal } from "@/hooks/use-modal"
import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react"
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

    return (
        <>
            <div
                className="rounded-2xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 group"
                onClick={() => setDetailOpen(true)}
            >
                {/* Color banner */}
                <div
                    className="h-24 flex items-end px-4 pb-3"
                    style={{ backgroundColor: project.background }}
                >
                    <h3 className="text-white font-bold text-base leading-tight drop-shadow">
                        {project.name}
                    </h3>
                </div>

                {/* Card footer */}
                <div className="bg-white px-4 py-3 flex items-center justify-between">
                    {/* Members */}
                    <div className="flex items-center gap-2">
                        <div className="flex">
                            {project.invited_users.slice(0, 4).map((user) => (
                                <div
                                    key={user.id}
                                    className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white -ml-1 first:ml-0"
                                    style={{
                                        backgroundColor:
                                            project.background + "cc",
                                    }}
                                    title={`${user.first_name} ${user.last_name}`}
                                >
                                    {user.first_name[0]}
                                </div>
                            ))}
                            {project.invited_users.length > 4 && (
                                <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600 -ml-1">
                                    +{project.invited_users.length - 4}
                                </div>
                            )}
                        </div>
                        {project.invited_users.length === 0 && (
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                <Users className="w-3 h-3" /> No members
                            </span>
                        )}
                    </div>

                    {/* Actions menu */}
                    <div
                        ref={menuRef}
                        className="relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setMenuOpen((v) => !v)}
                            className="w-7 h-7 rounded hover:bg-slate-100 flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 bottom-full mb-1 bg-white rounded-xl shadow-lg border overflow-hidden z-50">
                                <button
                                    style={{
                                        width: 160,
                                        height: 40,
                                        padding: "0 12px",
                                    }}
                                    className="flex items-center gap-2 text-sm hover:bg-muted w-full"
                                    onClick={() => {
                                        setProject(project)
                                        editModal.openModal()
                                        setMenuOpen(false)
                                    }}
                                >
                                    <Pencil className="w-4 h-4" /> Edit
                                </button>
                                <button
                                    style={{
                                        width: 160,
                                        height: 40,
                                        padding: "0 12px",
                                    }}
                                    className="flex items-center gap-2 text-sm text-red-500 hover:bg-muted w-full"
                                    onClick={() => {
                                        setProject(project)
                                        deleteModal.openModal()
                                        setMenuOpen(false)
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        )}
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
