"use client"

import { Button } from "@/components/ui/button"
import { Calendar, type CalendarProps } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { DATE } from "@/lib/constants/date"
import { safeParseDateInput } from "@/lib/utils/date"
import { cn } from "@/lib/utils/shadcn"
import { formatDate } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { enUS } from "react-day-picker/locale"
import {
    type FieldValues,
    type Path,
    type PathValue,
    useController,
    type UseFormReturn,
} from "react-hook-form"
import ErrorMessage from "../ui/error-message"
import { Label } from "../ui/label"

interface IProps<IForm extends FieldValues> {
    methods: UseFormReturn<IForm>
    name: Path<IForm>
    label?: string
    placeholder?: string
    wrapperClassName?: string
    optional?: boolean
    showError?: boolean
    labelClassName?: string
    disabled?: boolean
    hasGradientBorder?: boolean
    triggerWrapperClassName?: string
    onValueChange?: (date: Date | undefined) => void
    calendarProps?: CalendarProps
    className?: string
}

const CALENDAR_CONFIG = {
    captionLayout: "dropdown" as const,
    endMonth: new Date(new Date().getFullYear() + 50, 11),
}

export default function ControlledDatePicker<IForm extends FieldValues>({
    methods,
    name,
    label,
    placeholder = "Select a date",
    wrapperClassName,
    className,
    optional = false,
    showError = false,
    labelClassName,
    disabled = false,
    hasGradientBorder = false,
    triggerWrapperClassName,
    onValueChange,
    calendarProps,
}: IProps<IForm>) {
    const [open, setOpen] = useState(false)

    const {
        field: { onChange, value, ref, onBlur, disabled: fieldDisabled },
        fieldState: { error },
    } = useController({
        name,
        control: methods.control,
        rules: {
            required: { value: !optional, message: "Required!" },
        },
        defaultValue: "" as PathValue<IForm, Path<IForm>>,
    })

    const selectedDate = safeParseDateInput(value) || undefined
    const isDisabled = fieldDisabled || disabled

    const handleDateSelect = (date: Date | undefined) => {
        const formattedDate =
            date ? formatDate(date, DATE.SERVER_FORMAT) : undefined
        onChange(formattedDate)
        onValueChange?.(date)
        setOpen(false)
    }

    useEffect(() => {
        if (value && !selectedDate) {
            // @ts-expect-error sasd
            methods.setValue(name, "")
        }
    }, [methods, name, selectedDate, value])

    return (
        <fieldset
            className={cn("flex flex-col gap-2 w-full", wrapperClassName)}
        >
            {label && (
                <Label
                    htmlFor={name}
                    className={cn(
                        !!error && "text-destructive",
                        labelClassName,
                    )}
                    required={!optional}
                >
                    {label}
                </Label>
            )}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div className={triggerWrapperClassName}>
                        <Button
                            variant="outline"
                            disabled={isDisabled}
                            className={cn(
                                "w-full justify-start text-left font-normal active:scale-100",
                                !selectedDate && "text-muted-foreground",
                                isDisabled && "opacity-50 cursor-not-allowed",
                                hasGradientBorder && "bg-transparent border-0",
                                className,
                            )}
                            ref={ref}
                            onBlur={onBlur}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ?
                                formatDate(selectedDate, "PPP")
                            :   placeholder}
                        </Button>
                    </div>
                </PopoverTrigger>

                <PopoverContent className="p-0" align="start">
                    <Calendar
                        locale={enUS}
                        {...CALENDAR_CONFIG}
                        {...calendarProps}
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                    />
                </PopoverContent>
            </Popover>

            {!!error && showError && (
                <ErrorMessage>
                    {error.message || error.root?.message}
                </ErrorMessage>
            )}
        </fieldset>
    )
}
