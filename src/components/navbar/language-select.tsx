import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/hooks/use-language"
import { languages } from "@/lib/constants/options"
import { cn } from "@/lib/utils/shadcn"
import { CheckIcon, ChevronDown } from "lucide-react"
import { useState } from "react"

const SelectLanguage = () => {
    const { language, setLanguage } = useLanguage()
    const [isOpen, setIsOpen] = useState(false)

    const handleLanguageChange = (val: typeof language.value) => {
        if (val !== language.value) {
            const langObj = languages.find((l) => l.value === val)
            if (langObj) {
                setLanguage(langObj)
            }
        }
    }

    return (
        <DropdownMenu modal={false} onOpenChange={(open) => setIsOpen(open)}>
            <DropdownMenuTrigger className="flex items-center gap-1 w-22 shadow-none border-none px-2 focus:ring-0 focus:outline-none focus-visible:ring-0 data-[state=open]:ring-0 data-[state=open]:outline-none">
                <div className="flex items-center gap-2">
                    {language?.scr && (
                        <img
                            width={20}
                            height={20}
                            src={language.scr}
                            alt={language.label}
                            className="w-5 h-5"
                        />
                    )}
                    {language?.label}
                </div>
                <span className="relative">
                    <ChevronDown
                        size={16}
                        className={cn(
                            "transition-transform duration-200 ml-1",
                            isOpen ? "rotate-180" : "rotate-0",
                        )}
                    />
                </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {languages.map((item) => {
                    const isActive = item.value === language.value
                    return (
                        <DropdownMenuItem
                            key={item.value}
                            onSelect={() => handleLanguageChange(item.value)}
                            className={cn(
                                isActive && "bg-accent",
                                "cursor-pointer",
                            )}
                        >
                            <div className="flex items-center gap-2 w-full">
                                <img
                                    width={16}
                                    height={16}
                                    src={item.scr}
                                    alt={item.label}
                                    className="w-4 h-4"
                                />
                                {item.label}
                                {isActive && (
                                    <span className="flex-1 flex justify-end">
                                        <CheckIcon size={16} />
                                    </span>
                                )}
                            </div>
                        </DropdownMenuItem>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default SelectLanguage
