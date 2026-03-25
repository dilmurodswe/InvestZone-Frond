import { create } from "zustand"
import type { KanbanStatus } from "../-types"

interface State {
    status: KanbanStatus | null
}
interface Actions {
    setStatus: (status: KanbanStatus | null) => void
}

export const useStatusStore = create<State & Actions>((set) => ({
    status: null,
    setStatus: (status) => set({ status }),
}))
