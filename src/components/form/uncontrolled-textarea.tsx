"use client"

import { cn } from "@/lib/utils/shadcn"
import {
    type ChangeEvent,
    type ReactNode,
    type TextareaHTMLAttributes,
} from "react"
import {
    type FieldValues,
    type Path,
    type UseFormReturn,
} from "react-hook-form"
import { type ClassNameValue } from "tailwind-merge"
import ErrorMessage from "../ui/error-message"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"

interface IProps<IForm extends FieldValues> {
    methods: UseFormReturn<IForm>
    name: Path<IForm>
    label?: ReactNode
    wrapperClassName?: ClassNameValue
    showError?: boolean
    optional?: boolean
    onValueChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void
}

export default function UncontrolledTextarea<IForm extends FieldValues>({
    methods,
    name,
    label,
    wrapperClassName,
    showError = false,
    optional = false,
    onValueChange,
    className,
    ...props
}: IProps<IForm> & TextareaHTMLAttributes<HTMLTextAreaElement>) {
    const {
        register,
        formState: { errors },
    } = methods

    const { onChange, ...reg } = register(name, {
        required: {
            value: !optional,
            message: "Required!",
        },
    })

    return (
        <fieldset
            className={cn("flex flex-col gap-2 w-full", wrapperClassName)}
        >
            {label && (
                <Label
                    htmlFor={name}
                    className={cn(!!errors?.[name] && "text-destructive")}
                    required={!optional}
                >
                    {label}
                </Label>
            )}
            <Textarea
                placeholder={typeof label === "string" ? label : ""}
                id={name}
                onChange={(e) => {
                    onChange(e)
                    onValueChange?.(e)
                }}
                className={cn("min-h-40", className)}
                {...reg}
                {...props}
            />
            {showError && errors[name] && (
                <ErrorMessage>
                    {(errors[name]?.message as string) ||
                        errors.root?.[name]?.message}
                </ErrorMessage>
            )}
        </fieldset>
    )
}
