import { create } from "zustand"
import type { Order } from "../-types"

interface State {
    order: Order | null
}
interface Actions {
    setOrder: (order: Order | null) => void
}

export const useOrderStore = create<State & Actions>((set) => ({
    order: null,
    setOrder: (order) => set({ order }),
}))
