/* eslint-disable react-refresh/only-export-components */
"use client"

import { cn } from "@/lib/utils/shadcn"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { cva, type VariantProps } from "class-variance-authority"
import { CheckIcon } from "lucide-react"
import * as React from "react"

const checkboxVariants = cva(
    "peer border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary",
                outline: "bg-transparent border-primary text-primary",
                danger: "data-[state=checked]:bg-destructive data-[state=checked]:border-destructive data-[state=checked]:text-destructive-foreground",
                info: "data-[state=checked]:bg-info data-[state=checked]:border-info data-[state=checked]:text-background",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
)

export type CheckboxProps = React.ComponentProps<
    typeof CheckboxPrimitive.Root
> &
    VariantProps<typeof checkboxVariants>

function Checkbox({ className, variant, ...props }: CheckboxProps) {
    return (
        <CheckboxPrimitive.Root
            data-slot="checkbox"
            className={cn(checkboxVariants({ variant, className }))}
            {...props}
        >
            <CheckboxPrimitive.Indicator
                data-slot="checkbox-indicator"
                className="flex items-center justify-center text-current transition-none"
            >
                <CheckIcon className="size-3.5" />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    )
}

export { Checkbox, checkboxVariants }
