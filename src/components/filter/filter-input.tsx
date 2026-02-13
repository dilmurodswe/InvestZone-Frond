import { SEARCH_PARAMS } from "@/lib/constants/search-params"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { Input, type InputProps } from "../ui/input"

interface Props extends InputProps {
    searchKey?: string
    currentPageKey?: string
}

export default function FilterInput({
    searchKey = SEARCH_PARAMS.SEARCH,
    currentPageKey = SEARCH_PARAMS.PAGE,
    ...props
}: Props) {
    const navigate = useNavigate()
    const search = useSearch({ strict: false })
    // @ts-expect-error asdf
    const value = search[searchKey]
    const onChange = (val: string) => {
        navigate({
            // @ts-expect-error Allow passing a search object; router types are strict here
            search: {
                ...search,
                [searchKey]: val || undefined,
                [currentPageKey]: undefined,
            },
        })
    }

    return (
        <Input
            type="search"
            handleDebouncedInputValue={onChange}
            placeholder={"Search..."}
            defaultValue={value}
            {...props}
        />
    )
}
