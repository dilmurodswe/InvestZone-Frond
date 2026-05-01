export type RollingPlanStatus = "on_warehouse" | "in_cutting"

export type ReadyStrip = {
    product_id: number
    product_name: string
    strip_cut_width_mm: number
    quantity: number
    created_at: string
}

export type RollingPlanItem = {
    id: number
    ready_strip: number
    status: RollingPlanStatus
    total_pcs: number
    total_weight: number
    selected_weight_ton: number
    end_date: string
    calculated_meters: number
    pipe_length_mm: number
    product_name?: string
    strip_cut_width_mm?: number
}

export type RollingPlan = {
    id: number
    machine: number
    machine_name?: string
    plan_number: string
    status: RollingPlanStatus
    items: RollingPlanItem[]
    created_at: string
    updated_at: string
}

export type RollingPlanDetail = RollingPlan

export type Machine = {
    id: number
    name: string
    is_active: boolean
}
