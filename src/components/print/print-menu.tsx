import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, PrinterIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

/**
 * «Печать ▾» — bitta hujjatdan chiqadigan formalar ro'yxati.
 *
 * Ilgari bu bitta «Приложение» tugmasi edi va boshqa formalarni chiqarishning
 * iloji yo'q edi. Endi tanlangan forma darrov chop etish oynasida ochiladi —
 * oynada uni yana almashtirsa ham bo'ladi.
 */
export default function PrintMenu<T extends string>({
    options,
    onPick,
    disabled,
    title,
    size = "sm",
    variant = "outline",
    className,
}: {
    options: { id: T; label: string }[]
    /** Tanlangan forma bilan chop etish oynasini ochadi. */
    onPick: (id: T) => void
    disabled?: boolean
    /** Tugma o'chirilgan sababi (masalan «avval saqlang»). */
    title?: string
    size?: "sm" | "default"
    variant?: "outline" | "default" | "ghost"
    className?: string
}) {
    const { t } = useTranslation()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    size={size}
                    variant={variant}
                    disabled={disabled}
                    title={title}
                    className={className}
                >
                    <PrinterIcon className="w-4 h-4" />
                    {t("print.print")}
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </Button>
            </DropdownMenuTrigger>
            {/* Nomlari uzun («Товарно-транспортная накладная (форма № 1-Т…»),
                shuning uchun menyu keng va matn ikki qatorga o'rasa ham mayli. */}
            <DropdownMenuContent align="end" className="max-w-[22rem]">
                {options.map((option) => (
                    <DropdownMenuItem
                        key={option.id}
                        onSelect={() => onPick(option.id)}
                        className="whitespace-normal"
                    >
                        {option.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
