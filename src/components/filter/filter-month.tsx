import { DATE } from "@/lib/constants/date"
import { cn } from "@/lib/utils/shadcn"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { X } from "lucide-react"
import { type Options } from "vanilla-calendar-pro"
import "vanilla-calendar-pro/styles/index.css"
import { type InputProps } from "../ui/input"
import { Label } from "../ui/label"
import VanillaCalendar from "../vanilla-calendar-pro"

interface Props {
    monthKey?: string
    yearKey?: string
    config?: Options
    inputProps?: InputProps
    isClearable?: boolean
    closeOnSelect?: boolean
    wrapperClassName?: string
    label?: string
    startsFromOne?: boolean
    exact?: boolean
}

export default function FilterMonth({
    config,
    inputProps,
    isClearable = true,
    closeOnSelect = true,
    monthKey = DATE.MONTH,
    yearKey = DATE.YEAR,
    wrapperClassName,
    label,
    startsFromOne = false,
    exact = false,
}: Props) {
    const navigate = useNavigate()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const search: any = useSearch({ strict: false })
    const year = search[yearKey]
    const month =
        typeof search[monthKey] === "number" ?
            search[monthKey] - (startsFromOne ? 1 : 0)
        :   search[monthKey]
    const value =
        year && typeof month === "number" ?
            new Date(year, month).toLocaleString("en-US", {
                month: "long",
                year: "numeric",
            })
        :   ""

    const handleNavigate = (val: {
        month: number | undefined
        year: number | undefined
    }) => {
        navigate({
            // @ts-expect-error safd
            search: (prev) => ({
                ...(exact ? undefined : prev),
                [monthKey]:
                    typeof val.month === "number" ?
                        val.month + (startsFromOne ? 1 : 0)
                    :   val.month,
                [yearKey]: val.year,
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
                        onClickMonth(self) {
                            if (closeOnSelect) {
                                self.hide()
                            }
                            handleNavigate({
                                month: self.context.selectedMonth,
                                year: self.context.selectedYear,
                            })
                        },
                        selectedYear: year,
                        selectedMonth: month,
                        ...config,
                        type: "month",
                    }}
                    value={value}
                    className={cn("w-48", inputProps?.className)}
                    placeholder={new Date().toLocaleString("en-US", {
                        month: "long",
                        year: "numeric",
                    })}
                    {...inputProps}
                />
                {value && isClearable && (
                    <X
                        onClick={(e) => {
                            e.stopPropagation()
                            handleNavigate({
                                month: undefined,
                                year,
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
