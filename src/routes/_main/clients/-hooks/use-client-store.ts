import { create } from "zustand"
import type { Client } from "../-types"

interface State {
    client: Client | null
}
interface Actions {
    setClient: (client: Client | null) => void
}

export const useClientStore = create<State & Actions>((set) => ({
    client: null,
    setClient: (client) => set({ client }),
}))
