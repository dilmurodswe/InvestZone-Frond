import { create } from "zustand"
import type { RawMaterial } from "../-types"

interface State {
    rawMaterial: RawMaterial | null
}
interface Actions {
    setRawMaterial: (rawMaterial: RawMaterial | null) => void
}

export const useRawMaterialStore = create<State & Actions>((set) => ({
    rawMaterial: null,
    setRawMaterial: (rawMaterial) => set({ rawMaterial }),
}))
