import { usePost } from "@/hooks/react-query/mutations"
import { cn } from "@/lib/utils/shadcn"
import { Upload } from "lucide-react"
import type { ChangeEvent } from "react"
import {
    type FieldValues,
    type Path,
    type PathValue,
    useController,
    type UseFormReturn,
} from "react-hook-form"
import Img from "../custom/img"
import ErrorMessage from "../ui/error-message"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

interface IProps<IForm extends FieldValues> {
    methods: UseFormReturn<IForm>
    name: Path<IForm>
    label?: string
    wrapperClassName?: string
    optional?: boolean
    showError?: boolean
    onValueChange?: (e: ChangeEvent<HTMLInputElement>) => void
}

export default function ImgUploadField<IForm extends FieldValues>({
    methods,
    name,
    label,
    wrapperClassName,
    className,
    optional = false,
    showError = false,
    onValueChange,
    ...props
}: IProps<IForm> & React.InputHTMLAttributes<HTMLInputElement>) {
    const {
        field: { onChange, value, disabled, ...field },
        fieldState: { error },
    } = useController({
        name,
        control: methods.control,
        rules: {
            required: { value: !optional, message: "Required!" },
        },
        defaultValue: "" as PathValue<IForm, Path<IForm>>,
    })
    const { mutate, isPending } = usePost(
        {},
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        },
    )
    const isDisabled = isPending || disabled

    const handleFile = (file: File) => {
        mutate(
            "",
            {
                file: file,
            },
            {
                onSuccess: (data: { file: string }) => {
                    if (data?.file) {
                        onChange(data.file)
                    }
                },
            },
        )
    }

    return (
        <Label
            className={cn(
                "flex flex-col gap-2 w-full relative",
                wrapperClassName,
            )}
            htmlFor={name}
        >
            {label && (
                <Label
                    className={cn(!!error && "text-destructive")}
                    required={!optional}
                >
                    {label}
                </Label>
            )}
            <Input
                autoComplete="off"
                onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                        handleFile(file)
                    }
                    onValueChange?.(e)
                }}
                type="file"
                inputWrapperClassName={cn(
                    "absolute z-10 w-full h-full",
                    isDisabled && "cursor-not-allowed",
                )}
                className="hidden"
                disabled={isDisabled}
                {...field}
            />
            <Input
                autoComplete="off"
                leftNode={
                    value && <Img src={value} alt="img" className="w-6 h-6" />
                }
                rightNode={<Upload size={20} />}
                defaultValue={value}
                disabled={isDisabled}
                {...field}
                {...props}
            />
            {!!error && showError && (
                <ErrorMessage>
                    {error.message || error.root?.message}
                </ErrorMessage>
            )}
        </Label>
    )
}
