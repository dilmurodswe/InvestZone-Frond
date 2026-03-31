import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useNavigate, useSearch } from "@tanstack/react-router"
import {
    ALL_MANUFACTURE_STATUSES,
    MANUFACTURE_STATUS_CONFIG,
} from "./status-config"

export default function ManufactureFilter() {
    const navigate = useNavigate()
    const params = useSearch({ strict: false }) as { status?: string }
    const current = params.status ?? "all"

    const handleChange = (val: string) => {
        navigate({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            search: ((prev: any) => {
                const next = { ...prev }
                if (val === "all") {
                    delete next.status
                } else {
                    next.status = val
                }
                return next
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }) as any,
        })
    }

    return (
        <Select value={current} onValueChange={handleChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {ALL_MANUFACTURE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                        {MANUFACTURE_STATUS_CONFIG[s].label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
