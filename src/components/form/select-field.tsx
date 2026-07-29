"use client"
import { cn } from "@/lib/utils/shadcn"
import {
    type FieldValues,
    type Path,
    useController,
    type UseFormReturn,
} from "react-hook-form"
import { type ActionMeta, type SingleValue } from "react-select"
import BaseSelect, { type BaseSelectProps } from "../ui/base-select"
import ErrorMessage from "../ui/error-message"
import { Label } from "../ui/label"

// Define base props that will be common for all SelectField instances
interface CustomProps<IForm extends FieldValues, Option> {
    methods: UseFormReturn<IForm>
    name: Path<IForm>
    label?: string
    optional?: boolean
    wrapperClassName?: string
    onValueChange?: (o: SingleValue<Option>) => void
    showError?: boolean
}

// Create a type that combines base props with react-select Props
type SelectFieldProps<
    IForm extends FieldValues,
    Option = unknown,
> = CustomProps<IForm, Option> &
    Omit<
        BaseSelectProps<Option, false>,
        keyof CustomProps<IForm, Option> | "isMulti"
    >

export default function SelectField<
    IForm extends FieldValues,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Option extends Record<string, any>,
>({
    name,
    methods,
    label,
    optional = false,
    optionValueKey = "id" as Path<Option>,
    classNames,
    components: customComponents,
    wrapperClassName,
    options,
    onValueChange,
    showError = false,
    styles,
    ...props
}: SelectFieldProps<IForm, Option>) {
    const opts = options || []
    const { control } = methods
    const {
        field: { onChange, value, disabled, ...field },
        fieldState: { error },
    } = useController({
        name,
        control,
        rules: {
            validate: (val) => {
                if (optional) return true
                return (val !== undefined && val !== null) || "Required!"
            },
        },
    })

    const currentVal =
        (opts as Option[]).find(
            (o) => o[optionValueKey as keyof Option] === value,
        ) || null

    const handleOnchange = (
        val: SingleValue<Option>,
        _actionMeta: ActionMeta<Option>,
    ) => {
        onValueChange?.(val)
        if (val) {
            onChange((val as Option)[optionValueKey as keyof Option])
        } else {
            onChange(val)
        }
    }

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
            <BaseSelect<Option, false>
                components={{
                    ...customComponents,
                }}
                value={currentVal}
                onChange={(val, actionMeta) => handleOnchange(val, actionMeta)}
                options={opts}
                isDisabled={disabled}
                inputId={name}
                optionValueKey={optionValueKey}
                // Оба принимались в пропсах, но до селекта не доходили —
                // без них вызывающий код не мог поправить ни размер, ни вид.
                classNames={classNames}
                styles={styles}
                {...field}
                {...props}
                isMulti={false}
            />
            {!!error && showError && (
                <ErrorMessage>
                    {error.message || error.root?.message}
                </ErrorMessage>
            )}
        </fieldset>
    )
}
