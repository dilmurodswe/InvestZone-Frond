import { create } from "zustand"
import type { SubCategory } from "../../-types"

interface State {
    subCategory: SubCategory | null
}
interface Actions {
    setSubCategory: (subCategory: SubCategory | null) => void
}

export const useSubCategoryStore = create<State & Actions>((set) => ({
    subCategory: null,
    setSubCategory: (subCategory) => set({ subCategory }),
}))
