"use client"
import { cn } from "@/lib/utils/shadcn"
import { type ReactNode } from "react"
import {
    type FieldValues,
    type Path,
    type PathValue,
    type RegisterOptions,
    useController,
    type UseFormReturn,
} from "react-hook-form"
import ErrorMessage from "../ui/error-message"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
    type OtpProps,
} from "../ui/input-otp"
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

export default function OtpField<IForm extends FieldValues>({
    methods,
    name,
    maxLength,
    label,
    wrapperClassName,
    optional = false,
    showError = false,
    registerOptions,
    ...props
}: IProps<IForm> & Omit<OtpProps, "children" | "render">) {
    const {
        field: { onChange, value, ...field },
        fieldState: { error },
    } = useController({
        name,
        control: methods.control,
        rules: {
            required: {
                value: !optional,
                message: "Required!",
            },
            minLength: maxLength,
            ...registerOptions,
        },
        defaultValue: false as PathValue<IForm, Path<IForm>>,
    })

    return (
        <fieldset
            className={cn(
                "flex flex-col items-center gap-2 w-full",
                wrapperClassName,
            )}
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

            <InputOTP
                value={value}
                onChange={onChange}
                id={name}
                containerClassName="self-center"
                autoFocus
                {...field}
                {...props}
                maxLength={maxLength}
            >
                <InputOTPGroup className="gap-4">
                    {Array.from({ length: maxLength }).map((_, index) => (
                        <InputOTPSlot
                            // eslint-disable-next-line react-x/no-array-index-key
                            key={index}
                            index={index}
                            aria-invalid={!!error}
                        />
                    ))}
                </InputOTPGroup>
            </InputOTP>

            {!!error && showError && (
                <ErrorMessage>
                    {error.message || error.root?.message}
                </ErrorMessage>
            )}
        </fieldset>
    )
}
