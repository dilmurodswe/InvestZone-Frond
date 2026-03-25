import { create } from "zustand"
import type { Task } from "../-types"

interface State {
    task: Task | null
    selectedStatusId: number | null
}
interface Actions {
    setTask: (task: Task | null) => void
    setSelectedStatusId: (id: number | null) => void
}

export const useTaskStore = create<State & Actions>((set) => ({
    task: null,
    selectedStatusId: null,
    setTask: (task) => set({ task }),
    setSelectedStatusId: (id) => set({ selectedStatusId: id }),
}))
