/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@/lib/utils/shadcn"
import {
    type FieldValues,
    type Path,
    useController,
    type UseFormReturn,
} from "react-hook-form"
import {
    type ActionMeta,
    components,
    type MenuListProps,
    type MultiValue,
    type ValueContainerProps,
} from "react-select"
import BaseSelect, { type BaseSelectProps } from "../ui/base-select"
import { Checkbox } from "../ui/checkbox"
import ErrorMessage from "../ui/error-message"
import { Label } from "../ui/label"
import { Separator } from "../ui/separator"

// Define base props that will be common for all SelectField instances
interface BaseSelectFieldProps<IForm extends FieldValues, Option> {
    methods: UseFormReturn<IForm>
    name: Path<IForm>
    label?: string
    optional?: boolean
    wrapperClassName?: string
    onValueChange?: (o: MultiValue<Option>) => void
    showError?: boolean
}

// Create a type that combines base props with react-select Props
export type SelectFieldProps<
    IForm extends FieldValues,
    Option = unknown,
> = BaseSelectFieldProps<IForm, Option> &
    Omit<
        BaseSelectProps<Option, true>,
        keyof BaseSelectFieldProps<IForm, Option> | "isMulti"
    >

export default function MultiSelectField<
    IForm extends FieldValues,
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
                return val?.length > 0 || "Required!"
            },
        },
    })

    const multiCurrentVal = opts.filter((o) =>
        value?.includes((o as Option)[optionValueKey as keyof Option]),
    )

    const handleOnchange = (
        val: MultiValue<Option>,
        _actionMeta: ActionMeta<Option>,
    ) => {
        onValueChange?.(val)
        onChange(
            (val as Option[]).map((o) => o[optionValueKey as keyof Option]),
        )
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
            <BaseSelect<Option, true>
                components={{
                    ValueContainer,
                    MenuList,
                    ...customComponents,
                }}
                classNames={{
                    ...classNames,
                }}
                placeholder={"Select one or more"}
                value={multiCurrentVal as Option[]}
                onChange={(val, actionMeta) =>
                    handleOnchange(val as MultiValue<Option>, actionMeta)
                }
                options={opts}
                isDisabled={disabled}
                inputId={name}
                optionValueKey={optionValueKey}
                {...field}
                {...props}
                isMulti
            />
            {!!error && showError && (
                <ErrorMessage>
                    {error.message || error.root?.message}
                </ErrorMessage>
            )}
        </fieldset>
    )
}

const MenuList = <Option,>(props: MenuListProps<Option, true>) => {
    const { children, getValue, options, setValue } = props
    const val = getValue()
    return (
        <components.MenuList {...props}>
            <>
                <p className="flex items-center gap-2 p-2">
                    <Checkbox
                        onCheckedChange={(v) => {
                            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                            v ?
                                setValue(options as Option[], "select-option")
                            :   setValue([], "deselect-option")
                        }}
                        checked={val.length === options.length}
                    />{" "}
                    Select all
                </p>
                <Separator />
            </>
            {children}
        </components.MenuList>
    )
}

const ValueContainer = <Option,>({
    children,
    ...props
}: ValueContainerProps<Option, true>) => {
    // eslint-disable-next-line prefer-const
    let [values, input] = children as any

    if (Array.isArray(values)) {
        values = `${values.length} selected`
    }

    return (
        <components.ValueContainer {...props}>
            {values}
            {input}
        </components.ValueContainer>
    )
}
