import { cn } from "@/lib/utils/shadcn"
import {
    type FieldValues,
    type Path,
    type PathValue,
    useController,
    type UseFormReturn,
} from "react-hook-form"
import ReactQuill from "react-quill-new"
import "react-quill-new/dist/quill.snow.css"
import ErrorMessage from "../ui/error-message"
import { Label } from "../ui/label"

interface IProps<IForm extends FieldValues> {
    methods: UseFormReturn<IForm>
    name: Path<IForm>
    label?: string
    wrapperClassName?: string
    optional?: boolean
    showError?: boolean
    onValueChange?: (val: string) => void
}

export default function QuillField<IForm extends FieldValues>({
    methods,
    name,
    label,
    wrapperClassName,
    className,
    optional = false,
    showError = false,
    onValueChange,
    ...props
}: IProps<IForm> & ReactQuill.ReactQuillProps) {
    const {
        field: { onChange, disabled, ...field },
        fieldState: { error },
    } = useController({
        name,
        control: methods.control,
        rules: {
            required: { value: !optional, message: "Required!" },
        },
        defaultValue: "" as PathValue<IForm, Path<IForm>>,
    })

    return (
        <fieldset
            className={cn(
                "flex flex-col gap-2 w-full",
                disabled && "pointer-events-none",
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
            <ReactQuill
                theme="snow"
                onChange={(value) => {
                    onChange(value)
                    onValueChange?.(value)
                }}
                className="[&_.ql-toolbar]:rounded-t-sm [&_.ql-container]:rounded-b-sm [&_.ql-container]:min-h-40"
                modules={{
                    toolbar: [
                        [{ header: [1, 2, 3, 4, 5, 6, false] }],
                        ["bold", "italic", "underline", "strike", "blockquote"],
                        [
                            { list: "ordered" },
                            { list: "bullet" },
                            { indent: "-1" },
                            { indent: "+1" },
                        ],
                        ["link", "image", "video"],
                        ["clean"],
                    ],
                    clipboard: {
                        // toggle to add extra line breaks when pasting HTML:
                        matchVisual: false,
                    },
                }}
                formats={[
                    "header",
                    "bold",
                    "italic",
                    "underline",
                    "strike",
                    "blockquote",
                    "list",
                    "indent",
                    "link",
                    "image",
                    "video",
                ]}
                {...field}
                {...props}
            />
            {!!error && showError && (
                <ErrorMessage>
                    {error.message || error.root?.message}
                </ErrorMessage>
            )}
        </fieldset>
    )
}
