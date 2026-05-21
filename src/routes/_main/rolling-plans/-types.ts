// -types.ts  — RollingPlanProduct ga outer_dimension string qo'shildi
// (agar allaqachon bor bo'lsa, faqat string ekanini tekshiring)

export type RollingPlanStatus =
    | "plan"
    | "submitted"
    | "in_progress"
    | "completed"

export type ReadyStrip = {
    id: number
    product_id: number
    product_name: string
    strip_cut_width_mm: number
    quantity: number
    total_wes: number
    created_at: string
}

export type RollingPlanProduct = {
    id: number
    name: string
    category: number
    sub_category: number
    thickness: number
    outer_dimension: string // ← ishlatilmoqda
    extra_fields?: Record<string, unknown> // "Вес 1 погонного метра" shu yerda
}

export type RollingPlanItem = {
    id: number
    ready_strip: number
    product: RollingPlanProduct | null
    status: RollingPlanStatus
    strip_cut_width_mm: number
    total_pcs: number
    total_weight: number
    selected_weight_ton: number
    end_date: string | null
    plan_date: string | null
    calculated_meters: number
    pipe_length_mm: number
    product_name?: string
}

export type RollingPlanMachine = {
    id: number
    name: string
    is_active: boolean
}

export type RollingPlan = {
    id: number
    machine: RollingPlanMachine
    plan_number: string
    status?: RollingPlanStatus
    is_plan_fact: boolean // ← list API dan keladi
    items: RollingPlanItem[]
    date: string | null
    created_at: string
    updated_at: string
}

export type RollingPlanDetail = RollingPlan

export type Machine = {
    id: number
    name: string
    is_active: boolean
}
