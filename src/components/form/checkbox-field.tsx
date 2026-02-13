"use client"

import { cn } from "@/lib/utils/shadcn"
import type { ReactNode } from "react"
import {
    useController,
    type FieldValues,
    type Path,
    type PathValue,
    type RegisterOptions,
    type UseFormReturn,
} from "react-hook-form"
import { Checkbox, type CheckboxProps } from "../ui/checkbox"
import ErrorMessage from "../ui/error-message"
import { Label } from "../ui/label"

interface IProps<IForm extends FieldValues> {
    methods: UseFormReturn<IForm>
    name: Path<IForm>
    label?: ReactNode
    wrapperClassName?: string
    showError?: boolean
    optional?: boolean
    registerOptions?: RegisterOptions<IForm>
}

export default function CheckboxField<IForm extends FieldValues>({
    methods,
    name,
    label,
    wrapperClassName,
    optional = true,
    showError = false,
    registerOptions,
    ...props
}: IProps<IForm> & CheckboxProps) {
    const {
        field: { onChange, value, ...field },
        fieldState: { error },
    } = useController({
        name,
        control: methods.control,
        rules: {
            required: {
                value: !optional,
                message: `Required!`,
            },
            ...registerOptions,
        },
        defaultValue: false as PathValue<IForm, Path<IForm>>,
    })

    return (
        <fieldset
            className={cn("flex flex-col gap-2 w-full", wrapperClassName)}
        >
            <div className="flex items-center gap-2">
                <Checkbox
                    checked={value}
                    onCheckedChange={onChange}
                    id={name}
                    {...field}
                    {...props}
                />

                <Label
                    htmlFor={name}
                    className={cn(!!error && "text-destructive")}
                    required={!optional}
                >
                    {label}
                </Label>
            </div>
            {!!error && showError && (
                <ErrorMessage>
                    {error.message || error.root?.message}
                </ErrorMessage>
            )}
        </fieldset>
    )
}
