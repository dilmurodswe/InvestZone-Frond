"use client"

import { cn } from "@/lib/utils/shadcn"
import debounce from "lodash.debounce"
import { ChevronDown } from "lucide-react"
import { type Ref, useCallback } from "react"
import { type Path } from "react-hook-form"
import Select, {
    type ClassNamesConfig,
    type GroupBase,
    type Props,
    type SelectInstance,
} from "react-select"

export interface BaseSelectProps<
    Option,
    IsMulti extends boolean = false,
    Group extends GroupBase<Option> = GroupBase<Option>,
> extends Props<Option, IsMulti, Group> {
    handleDebouncedInputValue?: (val: string) => void
    optionLabelKey?: Path<Option>
    optionValueKey?: Path<Option>
    ref?: Ref<SelectInstance<Option, IsMulti, Group>>
}

function BaseSelect<
    Option,
    IsMulti extends boolean = false,
    Group extends GroupBase<Option> = GroupBase<Option>,
>({
    classNames,
    components: customComponents,
    styles,
    handleDebouncedInputValue,
    optionLabelKey = "name" as Path<Option>,
    optionValueKey = "id" as Path<Option>,
    ...props
}: BaseSelectProps<Option, IsMulti, Group>) {
    const debouncedSearch = debounce((val: string) => {
        handleDebouncedInputValue?.(val)
    }, 500)

    const handleInputChange = useCallback(
        (val: string) => {
            if (handleDebouncedInputValue) {
                debouncedSearch(val)
            }
        },
        [debouncedSearch, handleDebouncedInputValue],
    )

    return (
        <Select
            components={{
                DropdownIndicator,
                ...customComponents,
            }}
            isClearable
            classNames={{
                ...defaultSelectClassNames<Option, IsMulti, Group>(),
                ...classNames,
            }}
            unstyled
            noOptionsMessage={() => <p className="text-sm py-1">None</p>}
            hideSelectedOptions={false}
            closeMenuOnSelect={props.isMulti ? false : true}
            placeholder={"Select"}
            menuPortalTarget={document.body}
            styles={{
                menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999,
                    pointerEvents: "all",
                }),
                ...styles,
            }}
            getOptionLabel={(opt) =>
                String(opt[optionLabelKey as unknown as keyof Option])
            }
            getOptionValue={(opt) =>
                String(opt[optionValueKey as unknown as keyof Option])
            }
            onInputChange={handleInputChange}
            {...props}
        />
    )
}

export default BaseSelect

const defaultSelectClassNames = <
    Option,
    IsMulti extends boolean = false,
    Group extends GroupBase<Option> = GroupBase<Option>,
>(): ClassNamesConfig<Option, IsMulti, Group> => ({
    control: ({
        isFocused,
        isDisabled,
    }: {
        isFocused: boolean
        isDisabled: boolean
    }) =>
        cn(
            "min-h-10! flex rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium",
            isFocused ? "outline-none ring-2 ring-ring" : "",
            isDisabled ? "opacity-50" : "",
        ),
    placeholder: () => cn("text-muted-foreground truncate"),
    clearIndicator: () => cn("text-primary"),
    menuList: () =>
        cn(
            "mt-2 p-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none",
        ),
    option: ({ isSelected }: { isSelected: boolean }) =>
        cn(
            "border-b last:border-none first:rounded-t-md last:rounded-b-md px-2 py-1.5 text-sm! outline-none hover:bg-secondary",
            isSelected ?
                "bg-primary/70 hover:bg-primary/70 text-background"
            :   "",
        ),
    multiValue: () =>
        cn("bg-secondary rounded-md px-1 py-0.5 gap-1 justify-between"),
    valueContainer: () => "gap-1",
})

const DropdownIndicator = () => (
    <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
)
