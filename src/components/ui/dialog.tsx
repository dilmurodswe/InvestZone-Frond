"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import * as React from "react"

import { cn } from "@/lib/utils/shadcn"
import { XIcon } from "lucide-react"

function Dialog({
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
    return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
    return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
    return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
    return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
    return (
        <DialogPrimitive.Overlay
            data-slot="dialog-overlay"
            className={cn(
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60",
                className,
            )}
            {...props}
        />
    )
}

/**
 * Popups that render into <body> instead of into the dialog (the
 * vanilla-calendar datepicker) look like an outside click to Radix, which
 * would close the dialog the moment a date is picked.
 */
function isInsidePortalledPopup(
    event: CustomEvent<{ originalEvent: Event }>,
): boolean {
    const target = event.detail?.originalEvent?.target
    if (!(target instanceof Element)) return false
    return !!target.closest('[data-vc="calendar"]')
}

export type TDialogContent = React.ComponentProps<
    typeof DialogPrimitive.Content
> & {
    disableInteractOutside?: boolean
    closeButtonClassName?: string
    wrapperClassname?: string
}

function DialogContent({
    className,
    children,
    disableInteractOutside = false,
    closeButtonClassName,
    wrapperClassname,
    ...props
}: TDialogContent) {
    return (
        <DialogPortal data-slot="dialog-portal">
            <DialogOverlay />
            <DialogPrimitive.Content
                data-slot="dialog-content"
                className={cn(
                    "fixed top-[50%] left-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background clamp-[p,2,6] shadow-lg duration-200",
                    "w-[95%] py-4 md:py-6 max-w-full md:max-w-lg",
                    wrapperClassname,
                )}
                onInteractOutside={(e) => {
                    if (disableInteractOutside || isInsidePortalledPopup(e)) {
                        e.preventDefault()
                    }
                }}
                {...props}
                onCloseAutoFocus={(event) => {
                    event.preventDefault()
                    document.body.style.pointerEvents = ""
                }}
            >
                {/* Close Button */}
                <DialogPrimitive.Close
                    className={cn(
                        "absolute -top-1 clamp-[right,1,5] z-10 opacity-70 transition-opacity hover:opacity-100 focus:outline-none text-background",
                        closeButtonClassName,
                    )}
                >
                    <XIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                    <span className="sr-only">Close</span>
                </DialogPrimitive.Close>

                <div
                    className={cn(
                        "overflow-y-auto max-h-[calc(100vh-4rem)] p-1",
                        className,
                    )}
                >
                    {children}
                </div>
            </DialogPrimitive.Content>
        </DialogPortal>
    )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="dialog-header"
            className={cn(
                "flex flex-col gap-2 text-center sm:text-left",
                className,
            )}
            {...props}
        />
    )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="dialog-footer"
            className={cn(
                "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
                className,
            )}
            {...props}
        />
    )
}

function DialogTitle({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
    return (
        <DialogPrimitive.Title
            data-slot="dialog-title"
            className={cn("text-lg leading-none font-semibold", className)}
            {...props}
        />
    )
}

function DialogDescription({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
    return (
        <DialogPrimitive.Description
            data-slot="dialog-description"
            className={cn("text-muted-foreground text-sm", className)}
            {...props}
        />
    )
}

export {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
}
