import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { createContext, type ReactNode, useCallback, useState } from "react"

// Types
interface ConfirmOptions {
    title?: string
    description?: string
    confirmText?: string
    cancelText?: string
    variant?: "default" | "destructive"
}

interface ConfirmContextType {
    confirm: (options?: ConfirmOptions) => Promise<boolean>
}

interface ConfirmState extends ConfirmOptions {
    open: boolean
    resolve?: (value: boolean) => void
}

// Context
// eslint-disable-next-line react-refresh/only-export-components
export const ConfirmContext = createContext<ConfirmContextType | undefined>(
    undefined,
)

// Provider Component
export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<ConfirmState>({
        open: false,
        title: "Are you sure?",
        description: "",
        confirmText: "Continue",
        cancelText: "Cancel",
        variant: "default",
    })

    const confirm = useCallback(
        (options?: ConfirmOptions): Promise<boolean> => {
            return new Promise((resolve) => {
                setState({
                    open: true,
                    title: options?.title ?? "Are you sure?",
                    description: options?.description,
                    confirmText: options?.confirmText ?? "Continue",
                    cancelText: options?.cancelText ?? "Cancel",
                    variant: options?.variant ?? "default",
                    resolve,
                })
            })
        },
        [],
    )

    const handleConfirm = () => {
        state.resolve?.(true)
        setState((prev) => ({ ...prev, open: false }))
    }

    const handleCancel = () => {
        state.resolve?.(false)
        setState((prev) => ({ ...prev, open: false }))
    }

    return (
        <ConfirmContext value={{ confirm }}>
            {children}
            <AlertDialog open={state.open} onOpenChange={handleCancel}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {state.title || "Are you sure?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {state.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancel}>
                            {state.cancelText || "Cancel"}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirm}
                            className={
                                state.variant === "destructive" ?
                                    "bg-red-600 hover:bg-red-700 focus:ring-red-600"
                                :   ""
                            }
                        >
                            {state.confirmText || "Continue"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ConfirmContext>
    )
}
