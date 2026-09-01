import { create } from "zustand"
import type {
    FinanceCategory,
    FinanceKind,
} from "../../../finance/-hooks/use-finance-categories"

interface State {
    kind: FinanceKind
    selectedCategory: FinanceCategory | null
    /** row being edited/deleted in a modal (category or subcategory) */
    editing: FinanceCategory | null
}
interface Actions {
    setKind: (kind: FinanceKind) => void
    setSelectedCategory: (c: FinanceCategory | null) => void
    setEditing: (c: FinanceCategory | null) => void
}

export const useFcStore = create<State & Actions>((set) => ({
    kind: "expense",
    selectedCategory: null,
    editing: null,
    setKind: (kind) => set({ kind, selectedCategory: null }),
    setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
    setEditing: (editing) => set({ editing }),
}))
