/* eslint-disable @typescript-eslint/no-explicit-any */
import { SEARCH_PARAMS } from "@/lib/constants/search-params"
import { cn } from "@/lib/utils/shadcn"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { type ReactNode, useEffect } from "react"
import { type Path } from "react-hook-form"
import {
    type ActionMeta,
    type MenuListProps,
    type SingleValue,
    type ValueContainerProps,
    components,
} from "react-select"
import BaseSelect, { type BaseSelectProps } from "../ui/base-select"
import { Label } from "../ui/label"

interface CustomProps<Option> {
    filterKey: string
    currentPageKey?: string
    optionLabelKey?: Path<Option>
    optionValueKey?: Path<Option>
    label?: ReactNode
    wrapperClassname?: string
    pageKey?: string
    onValueChange?: (o: SingleValue<Option>) => void
    inputSearchKey?: string
}

type SelectFieldProps<Option = unknown> = CustomProps<Option> &
    Omit<BaseSelectProps<Option, false>, keyof CustomProps<Option> | "isMulti">

export default function FilterSelect<Option extends Record<string, any>>({
    filterKey,
    pageKey = SEARCH_PARAMS.PAGE,
    options,
    classNames,
    optionLabelKey = "name" as Path<Option>,
    optionValueKey = "id" as Path<Option>,
    components,
    label,
    wrapperClassname,
    required,
    onValueChange,
    inputSearchKey,
    ...props
}: SelectFieldProps<Option>) {
    const opts = options || []
    const navigate = useNavigate()
    const search: any = useSearch({ strict: false })
    const value = search[filterKey]

    const currentVal =
        (opts as Option[]).find(
            (o) => o[optionValueKey as keyof Option] === value,
        ) || null

    useEffect(() => {
        if (props.defaultValue) {
            navigate({
                search: {
                    ...search,
                    [filterKey]: (props.defaultValue as Option)[optionValueKey],
                },
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.defaultValue])

    const handleOnChange = (
        opt: SingleValue<Option>,
        _actionMeta: ActionMeta<Option>,
    ) => {
        onValueChange?.(opt)
        navigate({
            search: {
                ...search,
                [filterKey]: opt ? (opt as Option)[optionValueKey] : undefined,
                [pageKey]: undefined,
            },
        })
    }

    return (
        <div className={cn("inline-flex flex-col gap-1.5", wrapperClassname)}>
            {label && (
                <Label htmlFor={props.name} required={required}>
                    {label}
                </Label>
            )}
            <BaseSelect
                getOptionLabel={(opt) => opt[optionLabelKey]}
                getOptionValue={(opt) => opt[optionValueKey]}
                value={currentVal}
                options={options}
                components={{
                    ValueContainer,
                    MenuList,
                    ...components,
                }}
                onChange={handleOnChange}
                placeholder={label}
                {...props}
                isMulti={false}
            />
        </div>
    )
}

const MenuList = <Option,>(props: MenuListProps<Option, false>) => {
    const { children } = props

    return <components.MenuList {...props}>{children}</components.MenuList>
}

const ValueContainer = <Option,>({
    children,
    ...props
}: ValueContainerProps<Option, false>) => {
    // eslint-disable-next-line prefer-const
    let [values, input] = children as ReactNode[]

    if (Array.isArray(values)) {
        values = `${values.length} ta tanlandi`
    }

    return (
        <components.ValueContainer {...props}>
            {values}
            {input}
        </components.ValueContainer>
    )
}
