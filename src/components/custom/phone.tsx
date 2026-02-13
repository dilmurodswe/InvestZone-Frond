import { cn } from "@/lib/utils/shadcn"
import {
    usePhoneInput,
    type UsePhoneInputConfig,
} from "react-international-phone"
import type { ClassNameValue } from "tailwind-merge"

export default function Phone({
    className,
    value,
    isLink = true,
    ...props
}: {
    className?: ClassNameValue
    isLink?: boolean
} & UsePhoneInputConfig) {
    const { phone, inputValue } = usePhoneInput({
        ...props,
        value: value || "",
    })

    return isLink ?
            <a
                onClick={(e) => e.stopPropagation()}
                href={`tel:${phone}`}
                className={cn("text-info hover:text-info", className)}
            >
                {value ? inputValue : ""}
            </a>
        :   <span className={cn(className)}>{value ? inputValue : ""}</span>
}
