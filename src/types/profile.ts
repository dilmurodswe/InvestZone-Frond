export interface Profile {
    id: number
    phone_number: string
    first_name: string
    last_name: string
    role:
        | "admin"
        | "office_manager"
        | "warehouse_employee"
        | "production_manager"
        | "financier"
        | "master"
    is_active: boolean
}
