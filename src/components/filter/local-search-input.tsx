import { Input, type InputProps } from "@/components/ui/input"

interface Props extends Omit<InputProps, "onChange"> {
    onChange: (val: string) => void
}

export default function LocalFilterInput({ onChange, ...props }: Props) {
    return (
        <Input
            type="search"
            handleDebouncedInputValue={onChange}
            placeholder="Search..."
            {...props}
        />
    )
}
