import { X } from "lucide-react"
import { useState } from "react"
import type { DatesArr, Options } from "vanilla-calendar-pro"
import VanillaCalendar from "."
import type { InputProps } from "../ui/input"

interface Props {
    config?: Options
    inputProps?: InputProps
    isClearable?: boolean
    closeOnSelect?: boolean
}

export default function VanillaCalendarInput({
    config,
    inputProps,
    isClearable = true,
    closeOnSelect = true,
}: Props) {
    const [selectedDates, setSelectedDates] = useState<DatesArr>()

    return (
        <div className="relative flex items-center">
            <VanillaCalendar
                config={{
                    selectedDates,
                    onClickDate(self) {
                        setSelectedDates(self.context.selectedDates)
                        if (closeOnSelect) {
                            self.hide()
                        }
                    },
                    ...config,
                }}
                value={String(selectedDates?.[0] || "")}
                {...inputProps}
            />
            {selectedDates && isClearable && (
                <X
                    onClick={(e) => {
                        e.stopPropagation()
                        setSelectedDates(undefined)
                    }}
                    size={16}
                    className="absolute right-10 z-20"
                />
            )}
        </div>
    )
}
