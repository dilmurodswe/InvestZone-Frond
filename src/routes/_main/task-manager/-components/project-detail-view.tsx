import { Clock, MoreHorizontal, Paperclip, Plus, X } from "lucide-react"
import { useState } from "react"
import type { Project } from "../-types"

// Static demo Kanban data
const STATIC_COLUMNS = [
    {
        id: "todo",
        title: "To do",
        color: "#94a3b8",
        tasks: [
            {
                id: 1,
                title: "Mobile Wireframes",
                tag: "Viverra Diam",
                tagColor: "#3b82f6",
                attachments: 3,
                flagColor: "red",
                date: "Apr 12",
                avatars: ["/avatars/1.png"],
            },
            {
                id: 2,
                title: "User Research",
                description:
                    "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.",
                tag: "Maecenas Lacus",
                tagColor: "#3b82f6",
                attachments: 1,
                flagColor: "green",
                date: "Mar 4",
                avatars: ["/avatars/2.png", "/avatars/3.png"],
            },
            {
                id: 3,
                title: "Client Call",
                description:
                    "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.",
                tag: null,
                tagColor: null,
                attachments: 0,
                flagColor: "green",
                date: "Mar 10",
                avatars: [],
            },
        ],
    },
    {
        id: "in_progress",
        title: "In Progress",
        color: "#f97316",
        tasks: [
            {
                id: 4,
                title: "Login Flow",
                tag: "Nullam Velit",
                tagColor: "#3b82f6",
                attachments: 0,
                flagColor: "yellow",
                date: "Apr 3",
                avatars: ["/avatars/4.png"],
            },
            {
                id: 5,
                title: "Forgot Password Screen",
                tag: "Nullam Velit",
                tagColor: "#3b82f6",
                attachments: 0,
                flagColor: "green",
                date: "Apr 6",
                avatars: ["/avatars/2.png", "/avatars/3.png", "/avatars/1.png"],
            },
        ],
    },
    {
        id: "in_review",
        title: "In Review",
        color: "#8b5cf6",
        tasks: [
            {
                id: 6,
                title: "Landing Page",
                tag: "Maecenas Lacus",
                tagColor: "#3b82f6",
                attachments: 2,
                flagColor: "green",
                date: "Mar 8",
                avatars: ["/avatars/1.png", "/avatars/3.png"],
            },
            {
                id: 7,
                title: "Annual Presentation",
                description:
                    "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.",
                tag: "Maecenas Lacus",
                tagColor: "#3b82f6",
                attachments: 0,
                flagColor: "green",
                date: "Mar 15",
                avatars: ["/avatars/2.png", "/avatars/4.png"],
            },
            {
                id: 8,
                title: "Icons",
                tag: "Eget Integer",
                tagColor: "#3b82f6",
                attachments: 0,
                flagColor: "yellow",
                date: "Apr 10",
                avatars: ["/avatars/1.png"],
            },
        ],
    },
    {
        id: "done",
        title: "Done",
        color: "#22c55e",
        tasks: [
            {
                id: 9,
                title: "Product Mockups",
                tag: "Viverra Diam",
                tagColor: "#3b82f6",
                attachments: 0,
                flagColor: "green",
                date: "Mar 2",
                avatars: ["/avatars/3.png"],
            },
            {
                id: 10,
                title: "Workshop Ideas",
                tag: "Nullam Velit",
                tagColor: "#3b82f6",
                attachments: 0,
                flagColor: "yellow",
                date: "Mar 4",
                avatars: ["/avatars/2.png"],
            },
            {
                id: 11,
                title: "Navigation",
                tag: "Maecanes Lacus",
                tagColor: "#3b82f6",
                attachments: 0,
                flagColor: "red",
                date: "Mar 15",
                avatars: ["/avatars/1.png"],
            },
        ],
    },
]

const FLAG_COLORS: Record<string, string> = {
    red: "#ef4444",
    green: "#22c55e",
    yellow: "#eab308",
}

// function Avatar({ name }: { name?: string }) {
//     return (
//         <div
//             className="w-7 h-7 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-xs font-semibold text-slate-600 -ml-1 first:ml-0"
//             title={name}
//         >
//             {name ? name[0].toUpperCase() : "?"}
//         </div>
//     )
// }

interface TaskCardProps {
    task: (typeof STATIC_COLUMNS)[0]["tasks"][0]
}

function TaskCard({ task }: TaskCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 flex flex-col gap-2 cursor-pointer hover:shadow-md transition-shadow">
            <p className="font-semibold text-sm text-slate-800">{task.title}</p>
            {task.description && (
                <p className="text-xs text-slate-500 line-clamp-3">
                    {task.description}
                </p>
            )}
            {task.tag && (
                <span
                    className="self-start text-xs text-white font-medium px-2 py-0.5 rounded"
                    style={{ backgroundColor: task.tagColor ?? "#3b82f6" }}
                >
                    {task.tag}
                </span>
            )}
            <div className="flex items-center gap-3 text-slate-400 text-xs mt-1">
                {task.attachments > 0 && (
                    <span className="flex items-center gap-1">
                        <Paperclip className="w-3 h-3" /> {task.attachments}
                    </span>
                )}
                <span style={{ color: FLAG_COLORS[task.flagColor] }}>⚑</span>
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {task.date}
                </span>
                {/* {task.avatars.length > 0 && (
                    <div className="ml-auto flex">
                        {task.avatars.slice(0, 3).map((avatar, i) => (
                            <Avatar key={`${task.id}-${avatar}-${i}`} />
                        ))}
                    </div>
                )} */}
            </div>
        </div>
    )
}

interface Props {
    project: Project
    onClose: () => void
}

export default function ProjectDetailView({ project, onClose }: Props) {
    const [columns] = useState(STATIC_COLUMNS)

    return (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 text-white bg-black/80   backdrop-blur-sm">
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
                        <p className="text-white/70 text-xs">
                            {project.invited_users.length} members
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Member avatars */}
                    <div className="flex">
                        {project.invited_users.slice(0, 4).map((user) => (
                            <div
                                key={user.id}
                                className="w-8 h-8 rounded-full bg-white/30 border-2 border-white flex items-center justify-center text-xs font-bold -ml-1 first:ml-0"
                                title={`${user.first_name} ${user.last_name}`}
                            >
                                {user.first_name[0]}
                            </div>
                        ))}
                    </div>
                    <button className="ml-2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                        <Plus className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Kanban board */}
            <div className="flex-1 overflow-x-auto p-6">
                <div
                    className="flex gap-4 h-full"
                    style={{ minWidth: "max-content" }}
                >
                    {columns.map((col) => (
                        <div
                            key={col.id}
                            className="flex flex-col gap-3"
                            style={{ width: 280 }}
                        >
                            {/* Column header */}
                            <div className="flex items-center gap-2 px-1">
                                <span className="font-semibold text-sm text-slate-700">
                                    {col.title}
                                </span>
                                <span className="bg-slate-200 text-slate-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {col.tasks.length}
                                </span>
                                <div className="ml-auto flex items-center gap-1">
                                    <button className="w-6 h-6 rounded hover:bg-slate-200 flex items-center justify-center text-slate-500">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                    <button className="w-6 h-6 rounded hover:bg-slate-200 flex items-center justify-center text-slate-500">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Color bar */}
                            <div
                                className="h-1 rounded-full"
                                style={{ backgroundColor: col.color }}
                            />

                            {/* Tasks */}
                            <div className="flex flex-col gap-2">
                                {col.tasks.map((task) => (
                                    <TaskCard key={task.id} task={task} />
                                ))}
                            </div>

                            {/* Add task button */}
                            <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 px-1 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                                <Plus className="w-4 h-4" />
                                Add task
                            </button>
                        </div>
                    ))}

                    {/* Add column */}
                    <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 h-fit transition-colors whitespace-nowrap">
                        <Plus className="w-4 h-4" />
                        Add column
                    </button>
                </div>
            </div>
        </div>
    )
}
