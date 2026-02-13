import { DATE } from "@/lib/constants/date"
import { cn } from "@/lib/utils/shadcn"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { X } from "lucide-react"
import { useCallback, useEffect } from "react"
import { type Options } from "vanilla-calendar-pro"
import "vanilla-calendar-pro/styles/index.css"
import { type InputProps } from "../ui/input"
import { Label } from "../ui/label"
import VanillaCalendar from "../vanilla-calendar-pro"

interface Props {
    filterKey?: string
    config?: Options
    inputProps?: InputProps
    isClearable?: boolean
    closeOnSelect?: boolean
    wrapperClassName?: string
    label?: string
    defaultValue?: number
}

export default function FilterYear({
    config,
    inputProps,
    isClearable = true,
    closeOnSelect = true,
    filterKey = DATE.YEAR,
    wrapperClassName,
    label,
    defaultValue,
}: Props) {
    const navigate = useNavigate()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const search: any = useSearch({ strict: false })
    const value = search[filterKey]

    const handleNavigate = useCallback(
        (val: number | undefined) => {
            navigate({
                // @ts-expect-error asdf
                search: (prev) => ({
                    ...prev,
                    [filterKey]: val,
                }),
            })
        },
        [navigate, filterKey],
    )

    useEffect(() => {
        if (defaultValue) {
            handleNavigate(defaultValue)
        }
    }, [defaultValue, handleNavigate])

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
                        onClickYear(self) {
                            if (closeOnSelect) {
                                self.hide()
                            }
                            handleNavigate(self.context.selectedYear)
                        },
                        styles: {
                            month: "hidden",
                        },
                        selectedYear: value,
                        ...config,
                        type: "year",
                    }}
                    className={cn("w-28", inputProps?.className)}
                    value={value || ""}
                    placeholder={String(new Date().getFullYear())}
                    {...inputProps}
                />
                {value && isClearable && (
                    <X
                        onClick={(e) => {
                            e.stopPropagation()
                            handleNavigate(undefined)
                        }}
                        size={16}
                        className="absolute right-10 z-20 cursor-pointer"
                    />
                )}
            </div>
        </fieldset>
    )
}
