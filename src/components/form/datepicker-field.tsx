import { DATE } from "@/lib/constants/date"
import { cn } from "@/lib/utils/shadcn"
import { format } from "date-fns"
import { X } from "lucide-react"
import {
    useController,
    type FieldValues,
    type Path,
    type UseFormReturn,
} from "react-hook-form"
import { type DatesArr, type Options } from "vanilla-calendar-pro"
import "vanilla-calendar-pro/styles/index.css"
import ErrorMessage from "../ui/error-message"
import { type InputProps } from "../ui/input"
import { Label } from "../ui/label"
import VanillaCalendar from "../vanilla-calendar-pro"

interface CustomProps<IForm extends FieldValues> {
    methods: UseFormReturn<IForm>
    name: Path<IForm>
    label?: string
    optional?: boolean
    wrapperClassName?: string
    onValueChange?: (o: DatesArr[0]) => void
    showError?: boolean
    config?: Options
    inputProps?: InputProps
    isClearable?: boolean
    closeOnSelect?: boolean
}

export default function DatepickerField<IForm extends FieldValues>({
    methods,
    name,
    label,
    optional = false,
    wrapperClassName,
    onValueChange,
    showError = false,
    config,
    inputProps,
    isClearable = true,
    closeOnSelect = true,
}: CustomProps<IForm>) {
    const { control } = methods
    const {
        field: { onChange, value, ...field },
        fieldState: { error },
    } = useController({
        name,
        control,
        rules: {
            required: {
                value: !optional,
                message: "Required",
            },
        },
    })
    const currentValue = value ? new Date(value) : ""

    const handleOnChange = (val: DatesArr[0]) => {
        onValueChange?.(val)
        const formattedDate = format(val, DATE.SERVER_FORMAT)
        onChange(formattedDate)
    }

    return (
        <fieldset
            className={cn(
                "relative flex flex-col gap-2 w-full",
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
            <div className={cn("relative flex items-center w-full")}>
                <VanillaCalendar
                    config={{
                        onClickDate(self) {
                            if (closeOnSelect) {
                                self.hide()
                            }
                            if (self.context.selectedDates[0]) {
                                handleOnChange(self.context.selectedDates[0])
                            }
                        },
                        selectedDates: currentValue ? [currentValue] : [],
                        selectionYearsMode: true,
                        selectionMonthsMode: true,
                        selectionDatesMode: "single",
                        ...config,
                    }}
                    value={value}
                    inputWrapperClassName="w-full"
                    className={cn("w-full", inputProps?.className)}
                    placeholder={new Date().toLocaleString("en-US", {
                        month: "long",
                        year: "numeric",
                    })}
                    {...field}
                    {...inputProps}
                />
                {value && isClearable && (
                    <X
                        onClick={(e) => {
                            e.stopPropagation()
                            onChange(undefined)
                        }}
                        size={16}
                        className="absolute right-10 z-20 cursor-pointer"
                    />
                )}
            </div>
            {!!error && showError && (
                <ErrorMessage>
                    {error.message || error.root?.message}
                </ErrorMessage>
            )}
        </fieldset>
    )
}
