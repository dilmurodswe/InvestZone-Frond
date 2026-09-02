import { Checkbox } from "@/components/ui/checkbox"
import type { ColumnDef } from "@tanstack/react-table"
import { useCallback, useState } from "react"

/**
 * Row multi-selection for a `CustomTable`. Returns a checkbox column to
 * prepend to the column list, plus the selected id set and helpers.
 */
export function useBulkSelect<T extends { id: number }>() {
    const [selected, setSelected] = useState<Set<number>>(
        () => new Set<number>(),
    )

    const toggle = useCallback((id: number) => {
        setSelected((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }, [])

    const setAll = useCallback((ids: number[], on: boolean) => {
        setSelected(on ? new Set(ids) : new Set())
    }, [])

    const clear = useCallback(() => setSelected(new Set()), [])

    const selectionColumn = (ids: number[]): ColumnDef<T> => ({
        id: "select",
        header: () => (
            <Checkbox
                checked={ids.length > 0 && ids.every((id) => selected.has(id))}
                onCheckedChange={(v) => setAll(ids, v === true)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <span
                className="flex items-center"
                onClick={(e) => e.stopPropagation()}
            >
                <Checkbox
                    checked={selected.has(row.original.id)}
                    onCheckedChange={() => toggle(row.original.id)}
                    aria-label="Select row"
                />
            </span>
        ),
        meta: { className: "w-10" },
    })

    return { selected, toggle, setAll, clear, selectionColumn }
}
