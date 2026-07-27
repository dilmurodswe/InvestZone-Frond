import { useModal } from "@/hooks/use-modal"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import type { CSSProperties, ReactNode } from "react"
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
    closeButtonClassName?: string
    overlayClassName?: string
    /** Render into this element instead of <body> (e.g. the page content area). */
    container?: HTMLElement | null
    style?: CSSProperties
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
    closeButtonClassName,
    overlayClassName,
    container,
    style,
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
                    closeButtonClassName={closeButtonClassName}
                    overlayClassName={overlayClassName}
                    container={container}
                    style={style}
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
