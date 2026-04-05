// components/custom/combobox-or-input.tsx
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils/shadcn"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface ComboboxOrInputProps {
    options: { key: string; value: string }[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

export function ComboboxOrInput({
    options,
    value,
    onChange,
    placeholder = "Select or type...",
    className,
}: ComboboxOrInputProps) {
    const [open, setOpen] = useState(false)
    const [inputMode, setInputMode] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Extract unique keys from options
    const uniqueKeys = Array.from(
        new Map(options.map((opt) => [opt.key, opt])).values(),
    )

    useEffect(() => {
        if (inputMode && inputRef.current) {
            inputRef.current.focus()
        }
    }, [inputMode])

    if (inputMode) {
        return (
            <div className="relative flex-1">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={cn(
                        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
                        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                        className,
                    )}
                    onBlur={() => {
                        // Don't exit input mode immediately on blur, give time for click
                        setTimeout(() => {
                            if (!inputRef.current?.matches(":focus")) {
                                setInputMode(false)
                            }
                        }, 100)
                    }}
                />
                <button
                    type="button"
                    onClick={() => setInputMode(false)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                >
                    ⌄
                </button>
            </div>
        )
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between font-normal",
                        className,
                    )}
                >
                    {value || placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search field..." />
                    <CommandList>
                        <CommandEmpty>No field found.</CommandEmpty>
                        <CommandGroup heading="Existing fields">
                            {uniqueKeys.map((option) => (
                                <CommandItem
                                    key={option.key}
                                    value={option.key}
                                    onSelect={(currentValue) => {
                                        onChange(
                                            currentValue === value ? "" : (
                                                currentValue
                                            ),
                                        )
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.key ?
                                                "opacity-100"
                                            :   "opacity-0",
                                        )}
                                    />
                                    {option.key}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandGroup heading="Actions">
                            <CommandItem
                                onSelect={() => {
                                    setInputMode(true)
                                    setOpen(false)
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add new field...
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
