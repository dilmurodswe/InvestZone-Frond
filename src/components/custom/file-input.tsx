import { cn } from "@/lib/utils/shadcn"
import { Paperclip, X } from "lucide-react"

interface Props {
    /** File picked in this session, an existing URL string, or nothing. */
    value: File | string | null
    onChange: (file: File | null) => void
    placeholder?: string
    accept?: string
    className?: string
}

/** Styled replacement for a raw <input type="file">. */
export default function FileInput({
    value,
    onChange,
    placeholder = "Attach file",
    accept,
    className,
}: Props) {
    const fileName = value instanceof File ? value.name : null

    return (
        <label
            className={cn(
                "flex h-10 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 text-sm transition-colors hover:bg-accent",
                className,
            )}
        >
            <Paperclip className="size-4 shrink-0 text-muted-foreground" />
            <span
                className={cn("truncate", !fileName && "text-muted-foreground")}
            >
                {fileName ?? placeholder}
            </span>
            <input
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => onChange(e.target.files?.[0] ?? null)}
            />
            {fileName && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault()
                        onChange(null)
                    }}
                    className="ml-auto shrink-0 text-muted-foreground hover:text-destructive"
                >
                    <X className="size-4" />
                </button>
            )}
        </label>
    )
}
