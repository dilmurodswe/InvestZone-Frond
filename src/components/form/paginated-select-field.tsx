import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { usePaginatedSelect } from "@/hooks/react-query/use-paginated-select"
import { cn } from "@/lib/utils/shadcn"
import { Check, ChevronDown, Loader2, X } from "lucide-react"
import { type MouseEvent, type UIEvent, useMemo, useState } from "react"
import {
    useController,
    type FieldValues,
    type Path,
    type UseFormReturn,
} from "react-hook-form"
import { useTranslation } from "react-i18next"

type Option = { id: number; name: string }

/**
 * A form combobox whose options are paged in from the server 10 at a time
 * (see {@link usePaginatedSelect}): scroll the list for the next page, type to
 * search. Built on a plain list rather than react-select so picking an option
 * is a direct button click — reliable even with server-driven options.
 *
 * The chosen option is pinned so its label shows before its page has loaded
 * (e.g. when editing an existing record).
 */
export default function PaginatedSelectField<IForm extends FieldValues, T>({
    methods,
    name,
    url,
    mapOption,
    label,
    wrapperClassName,
    optional = false,
    selectedOption,
}: {
    methods: UseFormReturn<IForm>
    name: Path<IForm>
    /** List endpoint — must support `page`, `page_size` and `search`. */
    url: string
    /** Turns one API row into a `{ id, name }` option. */
    mapOption: (item: T) => Option
    label: string
    wrapperClassName?: string
    optional?: boolean
    /** Currently-selected row, so its label shows before its page loads. */
    selectedOption?: Option | null
}) {
    const { t } = useTranslation()
    const { control } = methods
    const {
        field: { value, onChange },
        fieldState: { error },
    } = useController({
        name,
        control,
        rules: {
            validate: (v) =>
                optional || (v !== undefined && v !== null) || "Required!",
        },
    })

    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [pinned, setPinned] = useState<Option | null>(selectedOption ?? null)

    const { items, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
        usePaginatedSelect<T>(url, search)

    const options = useMemo(
        () => items.map(mapOption),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [items],
    )

    const selected =
        value == null ? null
        : ((pinned?.id === value ?
            pinned
        :   options.find((o) => o.id === value)) ?? null)
    const selectedLabel = selected?.name ?? null

    const pick = (opt: Option) => {
        setPinned(opt)
        onChange(opt.id)
        setOpen(false)
    }

    const clear = (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onChange(null)
    }

    const onScroll = (e: UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget
        const nearBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight < 48
        if (nearBottom && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }

    return (
        <fieldset className={cn("flex flex-col gap-2 w-full", wrapperClassName)}>
            <Label
                htmlFor={name}
                className={cn(!!error && "text-destructive")}
                required={!optional}
            >
                {label}
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        id={name}
                        className={cn(
                            "min-h-10 flex items-center gap-2 rounded-md border border-input bg-background px-3 text-sm shadow-sm w-full",
                            !!error && "border-destructive",
                        )}
                    >
                        <span
                            className={cn(
                                "flex-1 truncate text-left",
                                !selectedLabel && "text-muted-foreground",
                            )}
                        >
                            {selectedLabel ?? t("common.select")}
                        </span>
                        {selectedLabel && (
                            <X
                                className="h-4 w-4 shrink-0 text-muted-foreground hover:text-foreground"
                                onClick={clear}
                            />
                        )}
                        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    align="start"
                    className="p-0 w-(--radix-popover-trigger-width)"
                >
                    <div className="p-2 border-b">
                        <Input
                            type="search"
                            autoFocus
                            placeholder={t("common.search")}
                            handleDebouncedInputValue={setSearch}
                        />
                    </div>
                    <div
                        className="max-h-64 overflow-y-auto"
                        onScroll={onScroll}
                    >
                        {options.map((o) => (
                            <button
                                key={o.id}
                                type="button"
                                onClick={() => pick(o)}
                                className={cn(
                                    "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-secondary",
                                    o.id === value && "bg-primary/10",
                                )}
                            >
                                <span className="truncate">{o.name}</span>
                                {o.id === value && (
                                    <Check className="h-4 w-4 shrink-0 text-primary" />
                                )}
                            </button>
                        ))}

                        {(isLoading || isFetchingNextPage) && (
                            <div className="flex items-center justify-center py-3 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                        )}
                        {!isLoading &&
                            !isFetchingNextPage &&
                            options.length === 0 && (
                                <div className="py-3 text-center text-sm text-muted-foreground">
                                    {t("common.noData")}
                                </div>
                            )}
                    </div>
                </PopoverContent>
            </Popover>
        </fieldset>
    )
}
