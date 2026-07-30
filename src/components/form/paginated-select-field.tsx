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
import { useMemo, useState, type MouseEvent, type UIEvent } from "react"
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
    onPick,
}: {
    methods: UseFormReturn<IForm>
    name: Path<IForm>
    /** List endpoint — must support `page`, `page_size` and `search`. */
    url: string
    /** Turns one API row into a `{ id, name }` option. */
    mapOption: (item: T) => Option
    /** Omitted inside table-style rows, where the column header is the label. */
    label?: string
    wrapperClassName?: string
    optional?: boolean
    /** Currently-selected row, so its label shows before its page loads. */
    selectedOption?: Option | null
    /** The whole API row behind the pick — for fields derived from it. */
    onPick?: (item: T | null) => void
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

    /** Option id → the API row it came from, so `onPick` can hand it back. */
    const rowsById = useMemo(() => {
        const map = new Map<number, T>()
        items.forEach((item) => map.set(mapOption(item).id, item))
        return map
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items])

    const selected =
        value == null ? null : (
            ((pinned?.id === value ?
                pinned
            :   options.find((o) => o.id === value)) ?? null)
        )
    const selectedLabel = selected?.name ?? null

    const pick = (opt: Option) => {
        setPinned(opt)
        onChange(opt.id)
        onPick?.(rowsById.get(opt.id) ?? null)
        setOpen(false)
    }

    const clear = (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onChange(null)
        onPick?.(null)
    }

    const onScroll = (e: UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget
        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48
        if (nearBottom && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }

    return (
        <fieldset
            className={cn(
                "flex min-w-0 flex-col gap-2 w-full",
                wrapperClassName,
            )}
        >
            {label && (
                <Label
                    htmlFor={name}
                    className={cn(!!error && "text-destructive")}
                    required={!optional}
                >
                    {label}
                </Label>
            )}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        id={name}
                        // В ячейке таблицы длинное имя всё равно обрежется —
                        // целиком его показывает подсказка.
                        title={selectedLabel ?? undefined}
                        className={cn(
                            "min-h-8 flex items-center gap-1.5 rounded-md border border-input bg-background px-2 text-xs shadow-sm w-full",
                            !!error && "border-destructive",
                        )}
                    >
                        {/* `min-w-0` — без него флекс-элемент не сжимается
                            меньше своего текста: длинное название распирало
                            кнопку, а с ней и ячейку таблицы, отбирая ширину у
                            соседних колонок вместо того чтобы обрезаться. */}
                        <span
                            className={cn(
                                "min-w-0 flex-1 truncate text-left",
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
                {/* Список шире поля: в строке таблицы колонка узкая, а
                    названия труб длинные — «Труба профильная прямоугольная
                    100 x 80 × 4.0 — IZSQ1008040» в ширину ячейки не влезает
                    и обрывался на полуслове. Меню растягивается по самому
                    длинному названию, но не шире экрана. */}
                <PopoverContent
                    align="start"
                    className="p-0 w-max min-w-(--radix-popover-trigger-width) max-w-[min(34rem,88vw)]"
                >
                    <div className="p-1.5 border-b">
                        <Input
                            type="search"
                            autoFocus
                            className="h-8 text-xs"
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
                                    "flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-xs hover:bg-secondary",
                                    o.id === value && "bg-primary/10",
                                )}
                            >
                                {/* Не обрезаем: если название всё же длиннее
                                    меню, пусть переносится, а не теряется. */}
                                <span className="whitespace-normal break-words leading-snug">
                                    {o.name}
                                </span>
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
                                <div className="py-3 text-center text-xs text-muted-foreground">
                                    {t("common.noData")}
                                </div>
                            )}
                    </div>
                </PopoverContent>
            </Popover>
        </fieldset>
    )
}
