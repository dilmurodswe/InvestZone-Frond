import { cn } from "@/lib/utils/shadcn"
import { NumericFormat, type NumericFormatProps } from "react-number-format"
import { Label } from "../ui/label"

interface IProps {
    label?: string
    wrapperClassName?: string
    rightIcon?: React.ReactNode
}

export default function NumberInput({
    name,
    label,
    wrapperClassName,
    className,
    rightIcon,
    ...props
}: IProps & NumericFormatProps) {
    return (
        <fieldset
            className={cn("flex flex-col gap-1 w-full", wrapperClassName)}
        >
            {label && <Label htmlFor={name}>{label}</Label>}

            <div className="relative flex items-center">
                <NumericFormat
                    id={name}
                    className={cn(
                        props.displayType === "input" &&
                            "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                        rightIcon && "pr-12",
                        className,
                    )}
                    thousandSeparator={" "}
                    placeholder={label}
                    allowNegative={false}
                    name={name}
                    isAllowed={({ floatValue }) => {
                        const num = Number(floatValue) || 0
                        const maxValue = Number(props.max)
                        const max = Number.isNaN(maxValue) ? Infinity : maxValue
                        const integerString = Math.trunc(num).toString()
                        const meetsSizeConstraint = integerString.length < 17

                        return num <= max && meetsSizeConstraint
                    }}
                    {...props}
                />

                {rightIcon && (
                    <span
                        className={cn(
                            "absolute right-3 text-muted-foreground",
                            props.disabled && "cursor-not-allowed opacity-50",
                        )}
                    >
                        {rightIcon}
                    </span>
                )}
            </div>
        </fieldset>
    )
}
