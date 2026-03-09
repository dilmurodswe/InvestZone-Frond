import { create } from "zustand"
import type { Supplier } from "../-types"

interface State {
    supplier: Supplier | null
}
interface Actions {
    setSupplier: (supplier: Supplier | null) => void
}

export const useSupplierStore = create<State & Actions>((set) => ({
    supplier: null,
    setSupplier: (supplier) => set({ supplier }),
}))
