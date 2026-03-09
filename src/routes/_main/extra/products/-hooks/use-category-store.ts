import { create } from "zustand"
import type { Category } from "../-types"

interface State {
    category: Category | null
}
interface Actions {
    setCategory: (category: Category | null) => void
}

export const useCategoryStore = create<State & Actions>((set) => ({
    category: null,
    setCategory: (category) => set({ category }),
}))
