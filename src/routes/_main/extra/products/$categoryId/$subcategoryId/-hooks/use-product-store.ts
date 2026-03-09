import { create } from "zustand"
import type { Product } from "../../../-types"

interface State {
    product: Product | null
}
interface Actions {
    setProduct: (product: Product | null) => void
}

export const useProductStore = create<State & Actions>((set) => ({
    product: null,
    setProduct: (product) => set({ product }),
}))
