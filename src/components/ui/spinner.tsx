import { cn } from "@/lib/utils/shadcn"

export interface SpinnerProps {
    size?: "sm" | "md" | "lg"
    color?: "primary" | "secondary" | "primary-foreground"
    className?: string
}

const Spinner = ({
    size = "md",
    color = "primary",
    className,
}: {
    size?: "sm" | "md" | "lg"
    color?: "primary" | "secondary" | "primary-foreground"
    className?: string
}) => {
    return (
        <div
            className={cn(
                `relative inline-flex items-center justify-center
               ${size === "sm" && "w-5 h-5"} ${size === "md" && "w-8 h-8"} ${size === "lg" && "w-10 h-9"}`,
                className,
            )}
        >
            <div
                className={`absolute w-full h-full rounded-full animate-[spin_0.8s_ease_infinite] border-solid border-t-transparent border-l-transparent border-r-transparent border-primary ${
                    size === "sm" ? "border-2" : "border-[3px]"
                } ${color === "secondary" && "border-b-white"} ${
                    color === "primary-foreground" &&
                    "border-b-primary-foreground"
                } `}
            />
            <div
                className={`absolute w-full h-full rounded-full opacity-75 animate-[spin_0.8s_linear_infinite]  border-dotted border-t-transparent border-l-transparent border-r-transparent border-primary 
              ${size === "sm" ? "border-2" : "border-[3px]"} ${color === "secondary" && "border-b-white"} ${
                  color === "primary-foreground" &&
                  "border-b-primary-foreground"
              } `}
            />
        </div>
    )
}

export default Spinner
