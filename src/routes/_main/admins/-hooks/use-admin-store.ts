import { create } from "zustand"
import type { Admin } from "../-types"

interface State {
    admin: Admin | null
}
interface Actions {
    setAdmin: (admin: Admin | null) => void
}

export const useAdminStore = create<State & Actions>((set) => ({
    admin: null,
    setAdmin: (admin) => set({ admin }),
}))
