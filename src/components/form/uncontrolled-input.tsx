"use client"

import { cn } from "@/lib/utils/shadcn"
import { type ChangeEvent, type ReactNode } from "react"
import {
    type FieldValues,
    type Path,
    type UseFormReturn,
} from "react-hook-form"
import { type ClassNameValue } from "tailwind-merge"
import ErrorMessage from "../ui/error-message"
import { Input, type InputProps } from "../ui/input"
import { Label } from "../ui/label"

interface IProps<IForm extends FieldValues> {
    methods: UseFormReturn<IForm>
    name: Path<IForm>
    label?: ReactNode
    wrapperClassName?: ClassNameValue
    showError?: boolean
    optional?: boolean
    onValueChange?: (e: ChangeEvent<HTMLInputElement>) => void
    labelClassName?: string
}

export default function UncontrolledInput<IForm extends FieldValues>({
    methods,
    name,
    label,
    wrapperClassName,
    showError = false,
    optional = false,
    onValueChange,
    placeholder,
    labelClassName,
    ...props
}: IProps<IForm> & InputProps) {
    const {
        register,
        formState: { errors },
    } = methods

    const { onChange, ref, ...reg } = register(name, {
        required: {
            value: !optional,
            message: "Required",
        },
        ...(props.type === "email" && {
            pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Incorrect email!",
            },
        }),
    })

    return (
        <fieldset
            className={cn("flex flex-col gap-2 w-full", wrapperClassName)}
        >
            {label && (
                <Label
                    htmlFor={name}
                    className={cn(
                        !!errors?.[name] && "text-destructive",
                        labelClassName,
                    )}
                    required={!optional}
                >
                    {label}
                </Label>
            )}
            <Input
                type={"text"}
                placeholder={
                    placeholder ? placeholder
                    : typeof label === "string" ?
                        label
                    :   ""
                }
                id={name}
                onChange={(e) => {
                    onChange(e)
                    onValueChange?.(e)
                }}
                {...reg}
                {...props}
                ref={ref}
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
