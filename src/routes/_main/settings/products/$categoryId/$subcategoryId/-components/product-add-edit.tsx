import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import UncontrolledInput from "@/components/form/uncontrolled-input"
import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"
import { useGet } from "@/hooks/react-query/use-get"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { cn } from "@/lib/utils/shadcn"
import { useParams } from "@tanstack/react-router"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    Italic,
    List,
    ListOrdered,
    PlusIcon,
    Trash2,
    UnderlineIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import {
    Controller,
    useFieldArray,
    useForm,
    type UseFormReturn,
} from "react-hook-form"
import { toast } from "sonner"
import { useProductStore } from "../-hooks/use-product-store"
import type { Category, Product } from "../../../-types"

export default function ProductAddEditModal() {
    return (
        <Modal modalKey="add-product" title={null}>
            <ProductAddEdit />
        </Modal>
    )
}

type ExtraField = { key: string; value: string }

type Form = Omit<
    Product,
    "id" | "extra_fields" | "description" | "outer_dimension"
> & {
    description: string
    extra_fields: ExtraField[]
    outer_dimension: string
}

// ─── Tiptap Toolbar ────────────────────────────────────────────────────────────
function ToolbarButton({
    active,
    onClick,
    children,
}: {
    active?: boolean
    onClick: () => void
    children: React.ReactNode
}) {
    return (
        <button
            type="button"
            onMouseDown={(e) => {
                e.preventDefault()
                onClick()
            }}
            className={cn(
                "p-1.5 rounded text-sm transition-colors",
                active ?
                    "bg-primary text-primary-foreground"
                :   "hover:bg-muted text-muted-foreground hover:text-foreground",
            )}
        >
            {children}
        </button>
    )
}

function RichTextEditor({
    value,
    onChange,
}: {
    value: string
    onChange: (val: string) => void
}) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
        ],
        content: value || "",
        onUpdate({ editor }) {
            onChange(editor.getHTML())
        },
    })
    useEffect(() => {
        if (editor && value && editor.getHTML() !== value) {
            editor.commands.setContent(value)
        }
    }, [editor, value])

    if (!editor) return null

    return (
        <div className="border rounded-lg overflow-hidden flex flex-col">
            <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b bg-muted/40">
                <ToolbarButton
                    active={editor.isActive("bold")}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    active={editor.isActive("italic")}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    active={editor.isActive("underline")}
                    onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                    }
                >
                    <UnderlineIcon className="w-4 h-4" />
                </ToolbarButton>
                <div className="w-px h-5 bg-border mx-1" />
                <ToolbarButton
                    active={editor.isActive({ textAlign: "left" })}
                    onClick={() =>
                        editor.chain().focus().setTextAlign("left").run()
                    }
                >
                    <AlignLeft className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    active={editor.isActive({ textAlign: "center" })}
                    onClick={() =>
                        editor.chain().focus().setTextAlign("center").run()
                    }
                >
                    <AlignCenter className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    active={editor.isActive({ textAlign: "right" })}
                    onClick={() =>
                        editor.chain().focus().setTextAlign("right").run()
                    }
                >
                    <AlignRight className="w-4 h-4" />
                </ToolbarButton>
                <div className="w-px h-5 bg-border mx-1" />
                <ToolbarButton
                    active={editor.isActive("bulletList")}
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                >
                    <List className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    active={editor.isActive("orderedList")}
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                >
                    <ListOrdered className="w-4 h-4" />
                </ToolbarButton>
            </div>
            <EditorContent
                editor={editor}
                className="prose prose-sm max-w-none min-h-[120px] p-3 focus-within:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[100px]"
            />
        </div>
    )
}

function ComboboxExtraField({
    index,
    form,
    suggestions,
    onRemove,
}: {
    index: number
    form: UseFormReturn<Form>
    suggestions: string[]
    onRemove: () => void
}) {
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState(
        form.getValues(`extra_fields.${index}.key`) ?? "",
    )

    const filtered = suggestions.filter((s) =>
        s.toLowerCase().includes(inputValue.toLowerCase()),
    )

    return (
        <div className="flex items-center gap-2">
            <div className="relative flex-1">
                <input
                    {...form.register(`extra_fields.${index}.key`)}
                    placeholder="Key"
                    autoComplete="off"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value)
                        form.setValue(
                            `extra_fields.${index}.key`,
                            e.target.value,
                        )
                        setOpen(true)
                    }}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 150)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                {open && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md overflow-hidden">
                        {filtered.length > 0 ?
                            filtered.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onMouseDown={() => {
                                        form.setValue(
                                            `extra_fields.${index}.key`,
                                            s,
                                        )
                                        setInputValue(s)
                                        setOpen(false)
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
                                >
                                    {s === inputValue && (
                                        <span className="text-primary">✓</span>
                                    )}
                                    {s}
                                </button>
                            ))
                        :   <p className="px-3 py-2 text-sm text-muted-foreground italic">
                                Yangi kalit qo'shiladi
                            </p>
                        }
                    </div>
                )}
            </div>

            <input
                {...form.register(`extra_fields.${index}.value`)}
                placeholder="Value"
                className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />

            <button
                type="button"
                onClick={onRemove}
                className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    )
}

// ─── Main Form ─────────────────────────────────────────────────────────────────
function ProductAddEdit() {
    const { closeModal } = useModal("add-product")
    const { invalidateByExactMatch } = useRevalidate()
    const { product } = useProductStore()
    const { categoryId, subcategoryId } = useParams({ strict: false })
    const { post, patch, isPending } = useRequest()

    // Category info — to check if type === "truba"
    const { data: categoryData } = useGet<Category>(
        `extra/categories/${categoryId}`,
    )
    const isTruba = categoryData?.type === "truba"
    console.log(isTruba)

    const { data: extraFieldSuggestions } = useGet<
        { key: string; value: string }[]
    >(API.EXTRA.EXTRA_FIELDS.INDEX)
    const suggestions = extraFieldSuggestions?.map((f) => f.key) ?? []

    const extraFieldsDefault: ExtraField[] =
        product?.extra_fields ?
            Object.entries(product.extra_fields).map(([key, value]) => ({
                key,
                value: String(value),
            }))
        :   []

    const form = useForm<Form>({
        defaultValues: {
            name: "",
            category: Number(categoryId),
            sub_category: Number(subcategoryId),
            code: 0,
            articul: "",
            price: 0,
            theoretically_price: 0,
            factually_price: 0,
            description: "",
            extra_fields: [],
            outer_dimension: "",
        },
        values:
            product ?
                {
                    name: product.name,
                    category: product.category,
                    sub_category: product.sub_category,
                    code: product.code,
                    articul: product.articul,
                    price: product.price,
                    theoretically_price: product.theoretically_price,
                    factually_price: product.factually_price,
                    description: product.description ?? "",
                    extra_fields: extraFieldsDefault,
                    outer_dimension: product.outer_dimension ?? "",
                }
            :   undefined,
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "extra_fields",
    })

    const onSuccess = () => {
        invalidateByExactMatch([API.EXTRA.PRODUCTS.INDEX])
        closeModal()
        toast.success(
            product ? "Updated successfully" : "Product added successfully",
        )
    }

    const onSubmit = form.handleSubmit((vals) => {
        const extra_fields: Record<string, string> = {}
        for (const f of vals.extra_fields) {
            if (f.key.trim()) extra_fields[f.key.trim()] = f.value
        }

        const payload: Record<string, unknown> = {
            name: vals.name,
            category: vals.category,
            sub_category: vals.sub_category,
            code: vals.code,
            articul: vals.articul,
            price: vals.price,
            theoretically_price: vals.theoretically_price,
            factually_price: vals.factually_price,
            description: vals.description,
            extra_fields,
            outer_dimension: vals.outer_dimension || null,
        }

        if (product) {
            patch(
                API.EXTRA.PRODUCTS.ID.INDEX.replace("{id}", String(product.id)),
                payload,
                { onSuccess },
            )
        } else {
            post(API.EXTRA.PRODUCTS.INDEX, payload, { onSuccess })
        }
    })

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>{product ? "Edit Product" : "Add Product"}</CardTitle>

            <UncontrolledInput
                methods={form}
                name="name"
                label="Product name"
            />
            <UncontrolledInput methods={form} name="articul" label="SKU" />
            <UncontrolledInput
                methods={form}
                name="price"
                label="Price"
                type="number"
                step="any"
            />
            <UncontrolledInput
                methods={form}
                name="factually_price"
                label="Factually Price"
                type="number"
                step="any"
            />
            <UncontrolledInput
                methods={form}
                name="theoretically_price"
                label="Theoretically Price"
                type="number"
                step="any"
            />

            {/* Наружный размер, мм — always visible */}
            <UncontrolledInput
                methods={form}
                name="outer_dimension"
                label="Наружный размер, мм"
            />

            {/* Description */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                    Description{" "}
                    <span className="text-muted-foreground font-normal">
                        (optional)
                    </span>
                </label>
                <Controller
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
            </div>

            {/* Extra fields */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                        Extra Fields
                    </label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 text-xs"
                        onClick={() => append({ key: "", value: "" })}
                    >
                        <PlusIcon className="w-3.5 h-3.5" />
                        Add Field
                    </Button>
                </div>

                {fields.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                        No extra fields. Click "Add Field" to add custom
                        key-value pairs.
                    </p>
                )}

                <div className="flex flex-col gap-2">
                    {fields.map((field, index) => (
                        <ComboboxExtraField
                            key={field.id}
                            index={index}
                            form={form}
                            suggestions={suggestions}
                            onRemove={() => remove(index)}
                        />
                    ))}
                </div>
            </div>

            <FormAction
                submitName={product ? "Save" : "Add"}
                loading={isPending}
            />
        </form>
    )
}
