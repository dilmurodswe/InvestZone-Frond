import { useEffect, useRef, useState } from "react"
import { Calendar, type Options } from "vanilla-calendar-pro"

import { cn } from "@/lib/utils/shadcn"
import { CalendarIcon } from "lucide-react"
import "vanilla-calendar-pro/styles/index.css"
import { Input, type InputProps } from "../ui/input"

export interface VanillaCalendarProps extends InputProps {
    config?: Options
}

function VanillaCalendar({
    config,
    className,
    ...attributes
}: VanillaCalendarProps) {
    const ref = useRef(null)
    const [calendar, setCalendar] = useState<Calendar | null>(null)

    useEffect(() => {
        if (!ref.current) return
        setCalendar(
            new Calendar(ref.current, {
                inputMode: true,
                selectedTheme: "light",
                ...config,
            }),
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref])

    useEffect(() => {
        if (!calendar) return
        calendar.init()
    }, [calendar])

    useEffect(() => {
        if (calendar) {
            calendar.set({ ...config })
        }
    }, [calendar, config])

    return (
        <Input
            rightNode={
                <CalendarIcon size={18} className="text-muted-foreground" />
            }
            readOnly
            className={cn("cursor-pointer", className)}
            {...attributes}
            ref={ref}
        />
    )
}

export default VanillaCalendar
