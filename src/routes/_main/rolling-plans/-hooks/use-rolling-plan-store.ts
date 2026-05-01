import { create } from "zustand"
import type { RollingPlan } from "../-types"

interface RollingPlanStore {
    rollingPlan: RollingPlan | null
    setRollingPlan: (plan: RollingPlan | null) => void
}

export const useRollingPlanStore = create<RollingPlanStore>((set) => ({
    rollingPlan: null,
    setRollingPlan: (plan) => set({ rollingPlan: plan }),
}))
