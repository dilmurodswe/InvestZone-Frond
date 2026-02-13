"use client"

import { cn } from "@/lib/utils/shadcn"
import { PhoneNumberUtil } from "google-libphonenumber"
import {
    type FieldValues,
    type Path,
    useController,
    type UseFormReturn,
} from "react-hook-form"
import { PhoneInput, type PhoneInputProps } from "react-international-phone"
import "react-international-phone/style.css"
import ErrorMessage from "../ui/error-message"
import { Label } from "../ui/label"

interface IProps<IForm extends FieldValues> {
    methods: UseFormReturn<IForm>
    name: Path<IForm>
    label?: string
    optional?: boolean
    showError?: boolean
    wrapperClassName?: string
    hideError?: boolean
    onValueChange?: (val: string) => void
    disableValidation?: boolean
}

const phoneUtil = PhoneNumberUtil.getInstance()

export default function PhoneField<IForm extends FieldValues>({
    methods,
    name,
    label = "Phone number",
    optional = false,
    showError = true,
    wrapperClassName,
    className,
    inputClassName,
    countrySelectorStyleProps,
    onValueChange,
    disableValidation = false,
    ...props
}: IProps<IForm> & PhoneInputProps) {
    const { control } = methods
    const isPhoneValid = (phone: string) => {
        try {
            return phoneUtil.isValidNumber(
                phoneUtil.parseAndKeepRawInput(phone),
            )
        } catch (err) {
            console.error(err)
            return false
        }
    }
    const {
        field: { value, onChange, ...field },
        fieldState: { error },
    } = useController({
        name,
        control,
        rules: {
            validate: (val: string) => {
                const v =
                    val ?
                        val.startsWith("+") ?
                            val
                        :   `+${val}`
                    :   ""
                let err = ""
                let isValid = true
                if (!optional) {
                    isValid = disableValidation ? true : isPhoneValid(v)
                    if (!isValid) {
                        err = "Fill in correctly and completely."
                    }
                }

                return isValid || err
            },
        },
        // @ts-expect-error sdf
        defaultValue: "",
    })

    const val =
        (value as string) ?
            value.startsWith("+") ?
                value
            :   `+${value}`
        :   ""

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
            <PhoneInput
                // hideDropdown
                // forceDialCode
                className={cn(
                    "w-full h-10 rounded-sm has-[input:focus]:ring-2 has-[input:focus]:ring-ring has-[input:focus]:ring-offset-0 outline-none!",
                    className,
                )}
                inputClassName={cn(
                    "w-full h-full! text-foreground! rounded-r-sm! px-3! bg-background! border-input! text-sm!",
                    inputClassName,
                )}
                countrySelectorStyleProps={{
                    // className="hidden",
                    buttonClassName:
                        "h-full! px-3! rounded-l-sm! bg-background! border-input!",
                    ...countrySelectorStyleProps,
                }}
                value={val}
                defaultCountry="uz"
                placeholder={label}
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
