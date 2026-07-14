import { create } from "zustand"
import type { StripBatch } from "../-types"

interface StripBatchStore {
    batch: StripBatch | null
    setBatch: (batch: StripBatch | null) => void
}

export const useStripBatchStore = create<StripBatchStore>((set) => ({
    batch: null,
    setBatch: (batch) => set({ batch }),
}))
