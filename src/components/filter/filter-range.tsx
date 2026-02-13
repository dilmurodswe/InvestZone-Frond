import { DATE } from "@/lib/constants/date"
import { cn } from "@/lib/utils/shadcn"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { format } from "date-fns"
import { X } from "lucide-react"
import { type DateAny, type Options } from "vanilla-calendar-pro"
import { type InputProps } from "../ui/input"
import { Label } from "../ui/label"
import VanillaCalendar from "../vanilla-calendar-pro"

interface Props {
    fromKey?: string
    toKey?: string
    config?: Options
    inputProps?: InputProps
    isClearable?: boolean
    closeOnSelect?: boolean
    wrapperClassName?: string
    label?: string
    exact?: boolean
}

export default function FilterRange({
    config,
    inputProps,
    isClearable = true,
    closeOnSelect = true,
    fromKey = DATE.FROM,
    toKey = DATE.TO,
    wrapperClassName,
    label,
    exact = false,
}: Props) {
    const navigate = useNavigate()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const search: any = useSearch({ strict: false })

    const from = search[fromKey]
    const to = search[toKey]
    const value = from ? `${from} - ${to || ""}` : ""

    const handleNavigate = (val: {
        from: DateAny | undefined
        to: DateAny | undefined
    }) => {
        navigate({
            // @ts-expect-error safd
            search: (prev) => ({
                ...(exact ? undefined : prev),
                [fromKey]: val.from,
                [toKey]: val.to,
            }),
        })
    }

    return (
        <fieldset
            className={cn("relative flex flex-col gap-1", wrapperClassName)}
        >
            {label && (
                <Label
                    htmlFor={inputProps?.name}
                    required={inputProps?.required}
                >
                    {label}
                </Label>
            )}
            <div className={cn("relative flex items-center")}>
                <VanillaCalendar
                    config={{
                        onClickDate(self) {
                            if (
                                closeOnSelect &&
                                self.context.selectedDates[1]
                            ) {
                                self.hide()
                            }
                            handleNavigate({
                                from: self.context.selectedDates[0],
                                to: self.context.selectedDates[1],
                            })
                        },
                        selectedDates:
                            from && !to ? [from]
                            : from && to ? [from, to]
                            : [],
                        ...config,
                        type: "default",
                        selectionDatesMode: "multiple-ranged",
                    }}
                    className={cn("min-w-60", inputProps?.className)}
                    value={value}
                    placeholder={`${format(new Date(), DATE.SERVER_FORMAT)} - ${format(new Date(), DATE.SERVER_FORMAT)}`}
                    {...inputProps}
                />
                {value && isClearable && (
                    <X
                        onClick={(e) => {
                            e.stopPropagation()
                            navigate({
                                // @ts-expect-error asd
                                search: (prev) => ({
                                    ...prev,
                                    [fromKey]: undefined,
                                    [toKey]: undefined,
                                }),
                            })
                            handleNavigate({
                                from: undefined,
                                to: undefined,
                            })
                        }}
                        size={16}
                        className="absolute right-10 z-20 cursor-pointer"
                    />
                )}
            </div>
        </fieldset>
    )
}
