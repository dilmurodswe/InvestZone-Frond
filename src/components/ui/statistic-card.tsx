import { cn } from "@/lib/utils/shadcn"
import { type LucideIcon } from "lucide-react"

interface StatisticCardProps {
    value: string
    label: string
    subText?: string
    icon: LucideIcon
    iconClassName?: string
}

export function StatisticCard({
    value,
    label,
    subText,
    icon: Icon,
    iconClassName,
}: StatisticCardProps) {
    return (
        <div className="bg-white rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-medium text-gray-900 mb-4">
                    {value}
                </h3>
                <div
                    className={cn(`p-3 rounded-lg bg-orange-50`, iconClassName)}
                >
                    <Icon className="text-orange-500" size={22} />
                </div>
            </div>
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500 mt-1">{label}</p>
                <p className="text-sm text-gray-500 mt-1">{subText}</p>
            </div>
        </div>
    )
}
