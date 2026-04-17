import FilterSelect from "@/components/filter/filter-select"
import { useSearch } from "@tanstack/react-router"
import { useProductExtraFieldValues } from "../-hooks/use-extra-field-values"

export function ExtraFieldFilter() {
    const { extraFieldValues } = useProductExtraFieldValues()
    const params = useSearch({ strict: false }) as Record<string, string>

    const tableNameOptions = extraFieldValues.map((f) => ({
        id: f.table_name,
        name: f.table_name,
    }))

    const selectedTableName = params.table_name ?? ""
    const selectedField = extraFieldValues.find(
        (f) => f.table_name === selectedTableName,
    )
    const tableOptionsList =
        selectedField?.table_options.map((o) => ({
            id: o,
            name: o,
        })) ?? []

    return (
        <div className="flex gap-2">
            <FilterSelect
                filterKey="table_name"
                placeholder="Extra Field"
                options={tableNameOptions}
            />
            {selectedTableName && tableOptionsList.length > 0 && (
                <FilterSelect
                    filterKey="table_options"
                    placeholder="Value"
                    options={tableOptionsList}
                />
            )}
        </div>
    )
}
