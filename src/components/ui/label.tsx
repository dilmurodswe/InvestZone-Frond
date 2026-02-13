"use client"

import { cn } from "@/lib/utils/shadcn"
import * as LabelPrimitive from "@radix-ui/react-label"
import * as React from "react"

function Label({
    className,
    required,
    children,
    labelClassName,
    ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & {
    required?: boolean
    labelClassName?: string
}) {
    return (
        <LabelPrimitive.Root
            data-slot="label"
            className={cn(
                "flex gap-1 text-text700 clamp-[text,xs,sm] leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
                className,
            )}
            {...props}
        >
            {required && (
                <span className={cn("text-destructive", labelClassName)}>
                    *
                </span>
            )}
            {children}
        </LabelPrimitive.Root>
    )
}

export { Label }
