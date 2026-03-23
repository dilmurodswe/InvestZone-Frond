export interface InvitedUser {
    id: number
    empl_id: number
    first_name: string
    last_name: string
    is_creator: boolean
}

export interface Project {
    id: number
    name: string
    background: string
    invited_users: InvitedUser[]
    created_at: string
    is_author: boolean
    author: number
}

export interface ProjectForm {
    name: string
    background: string
    employees: number[]
}
