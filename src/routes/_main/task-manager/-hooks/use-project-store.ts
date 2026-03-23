import { create } from "zustand"
import type { Project } from "../-types"

interface State {
    project: Project | null
}
interface Actions {
    setProject: (project: Project | null) => void
}

export const useProjectStore = create<State & Actions>((set) => ({
    project: null,
    setProject: (project) => set({ project }),
}))
