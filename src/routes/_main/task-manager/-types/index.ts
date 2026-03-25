export interface InvitedUser {
    id: number
    empl_id: number
    first_name: string
    last_name: string
    is_creator: boolean
}

export interface ProjectAuthor {
    id: number
    first_name: string
    last_name: string
}

export interface TaskCounts {
    todo: number
    processing: number
    finished: number
}

export interface Project {
    id: number
    name: string
    background: string
    invited_users: InvitedUser[]
    created_at: string
    is_author: boolean
    author: ProjectAuthor
    task_counts?: TaskCounts
}

export interface ProjectForm {
    name: string
    background: string
    employees: number[]
}

export interface TaskUser {
    id: number
    photo: string | null
    full_name: string
}

export interface Subtask {
    id?: number
    title: string
    finished: boolean
}

export interface Task {
    id: number
    title: string
    desc: string
    deadline: string
    priority: 1 | 2 | 3
    status_id: number
    users_data: TaskUser[]
    finished: number
    todo: number
    order: number
}

export interface KanbanStatus {
    id: number
    name: string
    has_delete: boolean
    author_id: number
    tasks: Task[]
    count: number
    is_author: boolean
}

export interface TaskForm {
    title: string
    desc: string
    status: number
    users: number[]
    order: number
    deadline: string
    priority: 1 | 2 | 3
    subtasks: Subtask[]
}

export interface TaskPatchForm {
    title?: string
    desc?: string
    status?: number
    users?: number[]
    order?: number
    deadline?: string
    priority?: 1 | 2 | 3
    subtasks?: Subtask[]
    deleted_subtasks?: number[]
}

export interface StatusForm {
    name: string
    project: number
}
