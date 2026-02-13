import { create } from "zustand"

interface State {
    isOpen: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: any
    variant: "success" | "error" | "warning"
    title: string
}

interface Actions {
    openMessageModal: (vals?: Partial<Omit<State, "isOpen">>) => void
    closeMessageModal: () => void
}

export const useMessageStore = create<State & Actions>((set) => ({
    isOpen: false,
    message: "",
    variant: "success",
    title: "",
    openMessageModal: (s) => {
        set({ isOpen: true, ...s })
    },
    closeMessageModal: () => {
        set({ isOpen: false })
    },
}))
