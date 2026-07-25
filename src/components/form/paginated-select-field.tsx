import SelectField from "@/components/form/select-field"
import { usePaginatedSelect } from "@/hooks/react-query/use-paginated-select"
import { useMemo, useState } from "react"
import type { FieldValues, Path, UseFormReturn } from "react-hook-form"

type Option = { id: number; name: string }

/**
 * A {@link SelectField} whose options are paged in from the server 10 at a
 * time (see {@link usePaginatedSelect}): scroll for the next page, type to
 * search. The chosen option is pinned so its label survives once the search
 * moves past it — otherwise the field would blank out after searching.
 */
export default function PaginatedSelectField<
    IForm extends FieldValues,
    T,
>({
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
    const [search, setSearch] = useState("")
    const [pinned, setPinned] = useState<Option | null>(selectedOption ?? null)

    const { items, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
        usePaginatedSelect<T>(url, search)

    const options = useMemo(() => {
        const mapped = items.map(mapOption)
        if (pinned && !mapped.some((o) => o.id === pinned.id)) {
            return [pinned, ...mapped]
        }
        return mapped
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, pinned])

    return (
        <SelectField
            methods={methods}
            name={name}
            options={options}
            label={label}
            optional={optional}
            wrapperClassName={wrapperClassName}
            filterOption={null}
            isLoading={isLoading || isFetchingNextPage}
            handleDebouncedInputValue={setSearch}
            onValueChange={(opt) => opt && setPinned(opt as Option)}
            onMenuScrollToBottom={() => {
                if (hasNextPage && !isFetchingNextPage) fetchNextPage()
            }}
        />
    )
}
