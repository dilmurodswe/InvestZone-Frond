import { useLocation } from "@tanstack/react-router"
import {
    createContext,
    type FC,
    type ReactNode,
    use,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react"

// Define the context interface
interface ModalContextType {
    modals: Record<string, boolean>
    openModal: (key: string) => void
    closeModal: (key: string) => void
}

// Create the context
const ModalContext = createContext<ModalContextType | undefined>(undefined)

// ModalProvider component to wrap your app
export const ModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const location = useLocation()
    const [modals, setModals] = useState<Record<string, boolean>>({})

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setModals({})
    }, [location.pathname])

    const openModal = useCallback((key: string) => {
        setModals((prev) => ({ ...prev, [key]: true }))
    }, [])
    const closeModal = useCallback((key: string) => {
        setModals((prev) => ({ ...prev, [key]: false }))
    }, [])

    const value = useMemo(
        () => ({ modals, openModal, closeModal }),
        [modals, openModal, closeModal],
    )

    return <ModalContext value={value}>{children}</ModalContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useModalContext = () => {
    const context = use(ModalContext)
    if (!context) {
        throw new Error("useModalContext must be used within a ModalProvider")
    }
    return context
}
