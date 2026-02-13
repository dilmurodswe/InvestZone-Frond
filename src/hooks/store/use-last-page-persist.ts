import { LS } from "@/lib/constants/localstorage"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface State {
    lastPage: string
}
interface Actions {
    setLastPageState: (vals: Partial<State>) => void
}

export const useLastPagePersist = create<State & Actions>()(
    persist(
        (set) => ({
            lastPage: "/",
            setLastPageState: (vals) => {
                set(vals)
            },
        }),
        { name: LS.LAST_PAGE },
    ),
)
