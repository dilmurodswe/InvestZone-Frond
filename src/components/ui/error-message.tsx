import { cn } from "@/lib/utils/shadcn"
import { type ReactNode } from "react"

interface IProps {
    children: ReactNode
    className?: string
}
export default function ErrorMessage({ children, className }: IProps) {
    return children ?
            <p
                className={cn(
                    "text-destructive text-xs font-medium",
                    className,
                )}
            >
                {children}
            </p>
        :   null
}
