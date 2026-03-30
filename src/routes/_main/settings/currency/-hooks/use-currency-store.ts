import { create } from "zustand"
import type { Currency } from "../-types"

interface State {
    currency: Currency | null
}
interface Actions {
    setCurrency: (currency: Currency | null) => void
}

export const useCurrencyStore = create<State & Actions>((set) => ({
    currency: null,
    setCurrency: (currency) => set({ currency }),
}))
