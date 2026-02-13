import { cn } from "@/lib/utils/shadcn"

const Loader = ({
    size = "md",
    variant = "primary",
}: {
    size?: "sm" | "md" | "lg" | "responsive"
    variant?: "primary" | "secondary" | "ghost" | "destructive" | "default"
}) => {
    return (
        <div
            className={cn(
                "relative inline-flex items-center justify-center",
                size === "sm" && "w-5 h-5",
                size === "md" && "w-8 h-8",
                size === "lg" && "w-10 h-9",
                size === "responsive" && "w-8 h-8 md:w-10 md:h-9",
            )}
        >
            <div
                className={cn(
                    "absolute w-full h-full rounded-full animate-[spin_0.8s_ease_infinite] border-solid border-primary border-t-transparent border-l-transparent border-r-transparent",
                    size === "sm" ? "border-2" : "border-[3px]",
                    variant === "secondary" && "border-b-white",
                    variant === "ghost" && "border-b-accent",
                    variant === "destructive" && "border-b-destructive",
                    variant === "default" && "border-b-foreground",
                )}
            />
            <div
                className={cn(
                    "absolute w-full h-full rounded-full opacity-75 animate-[spin_0.8s_linear_infinite] border-dotted border-primary border-t-transparent border-l-transparent border-r-transparent ",
                    size === "sm" ? "border-2" : "border-[3px]",
                    variant === "secondary" && "border-b-white",
                    variant === "ghost" && "border-b-accent",
                    variant === "destructive" && "border-b-destructive",
                    variant === "default" && "border-b-foreground",
                )}
            />
        </div>
    )
}

export default Loader
