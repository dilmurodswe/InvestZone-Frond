import { useModal } from "@/hooks/use-modal"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import type { ReactNode } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "../ui/dialog"

type Props = {
    modalKey?: string
    title?: ReactNode
    description?: ReactNode
    children?: ReactNode
    className?: string
    wrapperClassname?: string
    size?: string
    onClose?: () => void
}

const Modal = ({
    title,
    description,
    children,
    modalKey = "default",
    className = "",
    wrapperClassname = "",
    onClose,
}: Props) => {
    const { isOpen, closeModal } = useModal(modalKey)

    const handleClose = () => {
        if (onClose) {
            onClose()
        }
        closeModal()
    }

    return (
        <Dialog open={isOpen || false} onOpenChange={handleClose}>
            {isOpen && (
                <DialogContent
                    className={`max-w-lg ` + className}
                    aria-describedby=""
                    wrapperClassname={wrapperClassname}
                >
                    {title && <DialogTitle>{title}</DialogTitle>}
                    {!title && (
                        <VisuallyHidden>
                            <DialogTitle>title</DialogTitle>
                        </VisuallyHidden>
                    )}
                    {description && (
                        <DialogDescription>{description}</DialogDescription>
                    )}
                    {children}
                </DialogContent>
            )}
        </Dialog>
    )
}

export default Modal
