import { create } from "zustand"
import type { Manufacture } from "../-types"

interface ManufactureStore {
    manufacture: Manufacture | null
    setManufacture: (manufacture: Manufacture | null) => void
}

export const useManufactureStore = create<ManufactureStore>((set) => ({
    manufacture: null,
    setManufacture: (manufacture) => set({ manufacture }),
}))
