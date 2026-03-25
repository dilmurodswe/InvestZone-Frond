import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import {
    closestCorners,
    DndContext,
    DragOverlay,
    PointerSensor,
    useDroppable,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { format } from "date-fns"
import {
    Clock,
    Flag,
    MoreHorizontal,
    Pencil,
    Plus,
    Trash2,
    User,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useStatusStore } from "../-hooks/use-status-store"
import { useTaskStore } from "../-hooks/use-task-store"
import type { InvitedUser, KanbanStatus, Task } from "../-types"
import TaskDetailPage from "./task-detail-page"

const PRIORITY_MAP = {
    1: { label: "Low", color: "#22c55e" },
    2: { label: "Medium", color: "#eab308" },
    3: { label: "High", color: "#ef4444" },
} as const

const MAX_ORDER = 32760

function calcSafeOrder(prev: number, next: number): number {
    const mid = Math.round((prev + next) / 2)
    if (mid <= prev || mid >= next) return Math.min(prev + 1, MAX_ORDER)
    return Math.min(mid, MAX_ORDER)
}

function getAppendOrder(tasks: Task[]): number {
    if (tasks.length === 0) return 1024
    const max = Math.max(...tasks.map((t) => t.order))
    return Math.min(max + 1024, MAX_ORDER)
}

// ─── Task Card ────────────────────────────────────────────────────────────────

interface TaskCardProps {
    task: Task
    projectId: number
    statuses: KanbanStatus[]
    members: InvitedUser[]
    isDragging?: boolean
}

function TaskCard({
    task,
    projectId,
    statuses,
    members,
    isDragging,
}: TaskCardProps) {
    const [detailOpen, setDetailOpen] = useState(false)
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({ id: `task-${task.id}` })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging || isSortableDragging ? 0.35 : 1,
    }

    const priority = PRIORITY_MAP[task.priority]
    const total = (task.finished ?? 0) + (task.todo ?? 0)

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 flex flex-col gap-2 cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5 transition-all select-none"
                onClick={() => setDetailOpen(true)}
            >
                <p className="font-semibold text-sm text-slate-800 leading-snug">
                    {task.title}
                </p>

                {task.desc && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {task.desc}
                    </p>
                )}

                <div>
                    <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                        style={{
                            backgroundColor: priority.color + "18",
                            color: priority.color,
                        }}
                    >
                        <Flag className="w-2.5 h-2.5" />
                        {priority.label}
                    </span>
                </div>

                <div className="flex items-center gap-2 text-slate-400 text-xs">
                    {task.deadline && (
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(task.deadline), "dd MMM")}
                        </span>
                    )}
                    {total > 0 && (
                        <span className="flex items-center gap-1">
                            ✓ {task.finished}/{total}
                        </span>
                    )}
                    {task.users_data.length > 0 ?
                        <div className="flex ml-auto">
                            {task.users_data.slice(0, 3).map((u) => (
                                <div
                                    key={u.id}
                                    title={u.full_name}
                                    className="w-6 h-6 rounded-full bg-primary/20 border-2 border-white flex items-center justify-center text-xs font-bold text-primary -ml-1 first:ml-0"
                                >
                                    {u.full_name[0]}
                                </div>
                            ))}
                        </div>
                    :   <div className="ml-auto text-slate-300">
                            <User className="w-3.5 h-3.5" />
                        </div>
                    }
                </div>
            </div>

            {detailOpen && (
                <TaskDetailPage
                    task={task}
                    projectId={projectId}
                    statuses={statuses}
                    members={members}
                    onClose={() => setDetailOpen(false)}
                />
            )}
        </>
    )
}

// ─── Droppable Column Body ────────────────────────────────────────────────────
// Bo'sh column uchun useDroppable — @dnd-kit bo'sh SortableContext ga drop qilmaydi
// Shuning uchun har bir column body ni alohida droppable qilamiz

function DroppableColumnBody({
    statusId,
    tasks,
    projectId,
    statuses,
    members,
    activeTaskId,
}: {
    statusId: number
    tasks: Task[]
    projectId: number
    statuses: KanbanStatus[]
    members: InvitedUser[]
    activeTaskId: string | null
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: `col-${statusId}`,
    })

    const taskIds = tasks.map((t) => `task-${t.id}`)

    return (
        <div
            ref={setNodeRef}
            className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-2 min-h-0 transition-colors duration-150"
            style={{
                // Over bo'lganda hafif highlight
                backgroundColor: isOver ? "rgba(99,102,241,0.04)" : undefined,
                borderRadius: isOver ? 12 : undefined,
            }}
        >
            <SortableContext
                items={taskIds}
                strategy={verticalListSortingStrategy}
            >
                <div
                    className="flex flex-col gap-2 pb-1"
                    // Bo'sh column uchun minimal height — drop target sifatida
                    style={{ minHeight: tasks.length === 0 ? 80 : "auto" }}
                >
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            projectId={projectId}
                            statuses={statuses}
                            members={members}
                            isDragging={activeTaskId === `task-${task.id}`}
                        />
                    ))}

                    {/* Bo'sh column placeholder */}
                    {tasks.length === 0 && (
                        <div
                            className="flex items-center justify-center h-16 rounded-xl border-2 border-dashed transition-colors duration-150"
                            style={{
                                borderColor: isOver ? "#6366f1" : "#e2e8f0",
                                backgroundColor:
                                    isOver ? "#6366f108" : "transparent",
                            }}
                        >
                            <span className="text-xs text-slate-300">
                                {isOver ? "Release to drop" : "No tasks"}
                            </span>
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    )
}

// ─── Column ───────────────────────────────────────────────────────────────────

interface ColumnProps {
    status: KanbanStatus
    projectId: number
    statuses: KanbanStatus[]
    members: InvitedUser[]
    activeTaskId: string | null
}

function KanbanColumn({
    status,
    projectId,
    statuses,
    members,
    activeTaskId,
}: ColumnProps) {
    const { setTask, setSelectedStatusId } = useTaskStore()
    const { setStatus } = useStatusStore()
    const taskModal = useModal("add-task")
    const editStatusModal = useModal("add-status")
    const deleteStatusModal = useModal("delete-status")
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

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

    const openAddTask = () => {
        setTask(null)
        setSelectedStatusId(status.id)
        taskModal.openModal()
    }

    return (
        <div
            className="flex-shrink-0 flex flex-col rounded-2xl border border-slate-200/80"
            style={{
                width: 280,
                // Board height ga to'liq mos keladi
                // Ichida DroppableColumnBody flex-1 + overflow-y-auto
                backgroundColor: "#f8fafc",
                // Minimal va maksimal height — ekranga moslashadi
                minHeight: 0,
                // Column o'zi stretch bo'ladi — board flex items-stretch bilan
            }}
        >
            {/* Header */}
            <div className="flex items-center gap-2 px-3 pt-3 pb-2 flex-shrink-0">
                <span className="font-semibold text-sm text-slate-700 capitalize flex-1 truncate">
                    {status.name}
                </span>
                <span className="bg-slate-200 text-slate-500 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {status.count}
                </span>
                <button
                    onClick={openAddTask}
                    className="w-6 h-6 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
                >
                    <Plus className="w-4 h-4" />
                </button>
                {status.has_delete && (
                    <div ref={menuRef} className="relative flex-shrink-0">
                        <button
                            onClick={() => setMenuOpen((v) => !v)}
                            className="w-6 h-6 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border overflow-hidden z-50">
                                <button
                                    style={{
                                        width: 160,
                                        height: 38,
                                        padding: "0 12px",
                                    }}
                                    className="flex items-center gap-2 text-sm hover:bg-slate-50 w-full"
                                    onClick={() => {
                                        setStatus(status)
                                        editStatusModal.openModal()
                                        setMenuOpen(false)
                                    }}
                                >
                                    <Pencil className="w-4 h-4" /> Edit
                                </button>
                                <button
                                    style={{
                                        width: 160,
                                        height: 38,
                                        padding: "0 12px",
                                    }}
                                    className="flex items-center gap-2 text-sm text-red-500 hover:bg-slate-50 w-full"
                                    onClick={() => {
                                        setStatus(status)
                                        deleteStatusModal.openModal()
                                        setMenuOpen(false)
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Separator */}
            <div className="h-px bg-slate-200 mx-3 mb-2 flex-shrink-0" />

            {/* Droppable task area — flex-1, ichida scroll */}
            <DroppableColumnBody
                statusId={status.id}
                tasks={status.tasks}
                projectId={projectId}
                statuses={statuses}
                members={members}
                activeTaskId={activeTaskId}
            />

            {/* Add task footer */}
            <div className="px-3 pb-3 pt-1 flex-shrink-0">
                <button
                    onClick={openAddTask}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 w-full px-2 py-2 rounded-xl hover:bg-slate-200/60 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add task
                </button>
            </div>
        </div>
    )
}

// ─── Add Column Button ────────────────────────────────────────────────────────

function AddColumnButton({ onClick }: { onClick: () => void }) {
    return (
        <div className="flex-shrink-0 self-start" style={{ width: 260 }}>
            <button
                onClick={onClick}
                className="w-full h-14 rounded-2xl border-2 border-dashed border-slate-300 hover:border-primary/50 flex items-center justify-center gap-2 text-slate-400 hover:text-primary transition-all group bg-white/50 hover:bg-white/80"
            >
                <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                    <Plus className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Add column</span>
            </button>
        </div>
    )
}

// ─── Main Board ───────────────────────────────────────────────────────────────

interface KanbanBoardProps {
    initialStatuses: KanbanStatus[]
    projectId: number
    members: InvitedUser[]
    onAddColumn: () => void
}

export default function KanbanBoard({
    initialStatuses,
    projectId,
    members,
    onAddColumn,
}: KanbanBoardProps) {
    const [statuses, setStatuses] = useState(initialStatuses)
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
    const [activeTask, setActiveTask] = useState<Task | null>(null)
    const { patch } = useRequest()
    const { invalidateByExactMatch } = useRevalidate()

    useEffect(() => {
        setStatuses(initialStatuses)
    }, [initialStatuses])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    )

    const invalidateBoard = useCallback(() => {
        invalidateByExactMatch([
            API.TASK_MANAGER.PROJECT_TASKS.INDEX.replace(
                "{id}",
                String(projectId),
            ),
        ])
    }, [invalidateByExactMatch, projectId])

    const findTaskStatus = useCallback(
        (taskId: number) =>
            statuses.find((s) => s.tasks.some((t) => t.id === taskId)),
        [statuses],
    )

    const onDragStart = ({ active }: DragStartEvent) => {
        const id = Number(String(active.id).replace("task-", ""))
        setActiveTaskId(String(active.id))
        const task = statuses.flatMap((s) => s.tasks).find((t) => t.id === id)
        setActiveTask(task ?? null)
    }

    const onDragOver = ({ active, over }: DragOverEvent) => {
        if (!over) return

        const activeId = Number(String(active.id).replace("task-", ""))
        const overId = String(over.id)

        const activeStatus = findTaskStatus(activeId)
        if (!activeStatus) return

        // over: task ID yoki column droppable ID (col-{statusId})
        let overStatusId: number | null = null

        if (overId.startsWith("task-")) {
            const overTaskId = Number(overId.replace("task-", ""))
            const overStatus = findTaskStatus(overTaskId)
            if (overStatus && overStatus.id !== activeStatus.id) {
                overStatusId = overStatus.id
            }
        } else if (overId.startsWith("col-")) {
            // Bo'sh column ga drag — to'g'ridan-to'g'ri column ID
            const colId = Number(overId.replace("col-", ""))
            if (colId !== activeStatus.id) {
                overStatusId = colId
            }
        }

        if (overStatusId === null) return

        setStatuses((prev) => {
            const fromStatus = prev.find((s) => s.id === activeStatus.id)
            const toStatus = prev.find((s) => s.id === overStatusId)
            if (!fromStatus || !toStatus) return prev

            const task = fromStatus.tasks.find((t) => t.id === activeId)
            if (!task) return prev

            // Agar task allaqachon to'g'ri joyda bo'lsa — qayta ishlamaymiz
            const alreadyInTarget = toStatus.tasks.some(
                (t) => t.id === activeId,
            )
            if (alreadyInTarget) return prev

            const overIdx =
                overId.startsWith("task-") ?
                    toStatus.tasks.findIndex((t) => `task-${t.id}` === overId)
                :   toStatus.tasks.length // Column ga drop — oxiriga qo'y

            return prev.map((s) => {
                if (s.id === activeStatus.id) {
                    return {
                        ...s,
                        tasks: s.tasks.filter((t) => t.id !== activeId),
                    }
                }
                if (s.id === overStatusId) {
                    const newTasks = [...s.tasks]
                    newTasks.splice(
                        overIdx >= 0 ? overIdx : newTasks.length,
                        0,
                        { ...task, status_id: overStatusId! },
                    )
                    return { ...s, tasks: newTasks }
                }
                return s
            })
        })
    }

    const onDragEnd = ({ active, over }: DragEndEvent) => {
        setActiveTaskId(null)
        setActiveTask(null)

        if (!over) return

        const activeId = Number(String(active.id).replace("task-", ""))
        const overId = String(over.id)

        setStatuses((prev) => {
            const activeStatus = prev.find((s) =>
                s.tasks.some((t) => t.id === activeId),
            )
            if (!activeStatus) return prev

            const activeIdx = activeStatus.tasks.findIndex(
                (t) => t.id === activeId,
            )

            // Bir column ichida reorder
            if (overId.startsWith("task-")) {
                const overTaskId = Number(overId.replace("task-", ""))
                const overStatus = prev.find((s) =>
                    s.tasks.some((t) => t.id === overTaskId),
                )
                if (!overStatus) return prev

                if (activeStatus.id === overStatus.id) {
                    const overIdx = activeStatus.tasks.findIndex(
                        (t) => t.id === overTaskId,
                    )
                    const newTasks = arrayMove(
                        activeStatus.tasks,
                        activeIdx,
                        overIdx,
                    )

                    const prevOrder = newTasks[overIdx - 1]?.order ?? 0
                    const nextOrder =
                        newTasks[overIdx + 1]?.order ??
                        Math.min(
                            (newTasks[overIdx]?.order ?? 1024) + 1024,
                            MAX_ORDER,
                        )
                    const newOrder = calcSafeOrder(prevOrder, nextOrder)

                    patch(
                        API.TASK_MANAGER.TASKS.ID.replace(
                            "{id}",
                            String(activeId),
                        ),
                        { order: newOrder, status: activeStatus.id },
                        { onSuccess: invalidateBoard },
                    )

                    return prev.map((s) =>
                        s.id === activeStatus.id ?
                            {
                                ...s,
                                tasks: newTasks.map((t, i) =>
                                    i === overIdx ?
                                        { ...t, order: newOrder }
                                    :   t,
                                ),
                            }
                        :   s,
                    )
                }
            }

            // Cross-column yoki bo'sh column — onDragOver da UI allaqachon to'g'ri
            // Hozir task yangi statusda, API ga yuboramiz
            const newStatusObj = prev.find((s) =>
                s.tasks.some((t) => t.id === activeId),
            )
            if (!newStatusObj) return prev

            const newIdx = newStatusObj.tasks.findIndex(
                (t) => t.id === activeId,
            )
            const movedTask = newStatusObj.tasks[newIdx]

            const prevOrder = newStatusObj.tasks[newIdx - 1]?.order ?? 0
            const nextOrder =
                newStatusObj.tasks[newIdx + 1]?.order ??
                getAppendOrder(
                    newStatusObj.tasks.filter((_, i) => i !== newIdx),
                )

            const newOrder =
                prevOrder === 0 && (nextOrder <= 0 || nextOrder >= MAX_ORDER) ?
                    1024
                :   calcSafeOrder(prevOrder, nextOrder)

            patch(
                API.TASK_MANAGER.TASKS.ID.replace("{id}", String(activeId)),
                {
                    order: Math.min(newOrder, MAX_ORDER),
                    status: movedTask.status_id,
                },
                { onSuccess: invalidateBoard },
            )

            return prev.map((s) =>
                s.id === newStatusObj.id ?
                    {
                        ...s,
                        tasks: s.tasks.map((t) =>
                            t.id === activeId ? { ...t, order: newOrder } : t,
                        ),
                    }
                :   s,
            )
        })
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
        >
            {/*
                Layout:
                - h-full: project-detail-view dan kelgan flex-1 overflow-hidden ga to'liq sig'adi
                - overflow-x-auto: gorizontal scroll — columnlar ko'p bo'lsa
                - overflow-y-hidden: vertikal scroll yo'q (har column o'zida)
                - items-stretch: columnlar teng balandlikda
                - Scrollbar yashirilgan (CSS)
            */}
            <div
                className="flex gap-4 px-6 py-4 h-full overflow-x-auto overflow-y-hidden items-stretch"
                style={{
                    // Scrollbar yashirish — barcha browserlar
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
                // Webkit scrollbar yashirish uchun inline style ishlamaydi,
                // shuning uchun global CSS da .kanban-board::-webkit-scrollbar { display:none }
                // yoki quyidagi trick:
                onWheel={(e) => {
                    // Trackpad / sichqoncha g'ildiragi bilan gorizontal scroll
                    if (e.deltaY !== 0 && e.deltaX === 0) {
                        e.currentTarget.scrollLeft += e.deltaY
                    }
                }}
            >
                {statuses.map((status) => (
                    <KanbanColumn
                        key={status.id}
                        status={status}
                        projectId={projectId}
                        statuses={statuses}
                        members={members}
                        activeTaskId={activeTaskId}
                    />
                ))}

                {/* Add column — columnlardan keyin */}
                <AddColumnButton onClick={onAddColumn} />
            </div>

            <DragOverlay>
                {activeTask && (
                    <div className="bg-white rounded-xl shadow-2xl border border-primary/20 p-3 w-[272px] rotate-1 opacity-95">
                        <p className="font-semibold text-sm text-slate-800">
                            {activeTask.title}
                        </p>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    )
}
