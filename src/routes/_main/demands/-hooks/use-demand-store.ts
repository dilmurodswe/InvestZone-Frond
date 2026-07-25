import { create } from "zustand"
import type { Demand } from "../-types"

interface State {
    demand: Demand | null
}
interface Actions {
    setDemand: (demand: Demand | null) => void
}

export const useDemandStore = create<State & Actions>((set) => ({
    demand: null,
    setDemand: (demand) => set({ demand }),
}))
