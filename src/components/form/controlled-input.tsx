import { cn } from "@/lib/utils/shadcn"
import type { ChangeEvent, ReactNode } from "react"
import {
    useController,
    type FieldValues,
    type Path,
    type PathValue,
    type UseFormReturn,
} from "react-hook-form"
import ErrorMessage from "../ui/error-message"
import { Input, type InputProps } from "../ui/input"
import { Label } from "../ui/label"

interface IProps<IForm extends FieldValues> {
    methods: UseFormReturn<IForm>
    name: Path<IForm>
    label?: ReactNode
    wrapperClassName?: string
    optional?: boolean
    showError?: boolean
    onValueChange?: (e: ChangeEvent<HTMLInputElement>) => void
}

export default function ControlledInput<IForm extends FieldValues>({
    methods,
    name,
    label,
    wrapperClassName,
    optional = false,
    showError = false,
    onValueChange,
    placeholder,
    ...props
}: IProps<IForm> & InputProps) {
    const {
        field: { onChange, ...field },
        fieldState: { error },
    } = useController({
        name,
        control: methods.control,
        rules: {
            required: { value: !optional, message: "Required!" },
        },
        defaultValue: "" as PathValue<IForm, Path<IForm>>,
    })

    return (
        <fieldset
            className={cn("flex flex-col gap-2 w-full", wrapperClassName)}
        >
            {label && (
                <Label
                    htmlFor={name}
                    className={cn(!!error && "text-destructive")}
                    required={!optional}
                >
                    {label}
                </Label>
            )}
            <Input
                autoComplete="off"
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
                {...field}
                {...props}
            />
            {!!error && showError && (
                <ErrorMessage>
                    {error.message || error.root?.message}
                </ErrorMessage>
            )}
        </fieldset>
    )
}
