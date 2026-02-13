export interface Profile {
    id: number
    phone_number: string
    first_name: string
    last_name: string
    role: "admin" | "manager" | "delivery" | "service"
    is_active: boolean
}
