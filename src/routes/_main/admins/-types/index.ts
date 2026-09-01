import type { Profile } from "@/types/profile"

export type SalaryRateUnit = "fixed" | "day" | "hour"

export type Admin = Profile & {
    date_joined: string
    employee_code: number | null
    department: string | null
    position: string | null
    base_salary: string
    salary_rate_unit: SalaryRateUnit
    salary_norm: string
}
