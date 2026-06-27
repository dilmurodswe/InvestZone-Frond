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
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { useRawMaterialStore } from "../-hooks/use-raw-material-store"
import type { RawMaterial } from "../-types"

export default function RawMaterialAddEditModal() {
    return (
        <Modal modalKey="add-raw-material" title={null}>
            <RawMaterialAddEdit />
        </Modal>
    )
}

type ExtraField = { key: string; value: string }

type Form = Omit<RawMaterial, "id" | "extra_fields" | "description"> & {
    description: string
    extra_fields: ExtraField[]
}

// ─── Toolbar button ───────────────────────────────────────────────────────────
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

// ─── Rich text editor ─────────────────────────────────────────────────────────
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

// ─── Main form ────────────────────────────────────────────────────────────────
function RawMaterialAddEdit() {
    const { t } = useTranslation()
    const { closeModal } = useModal("add-raw-material")
    const { invalidateByExactMatch } = useRevalidate()
    const { rawMaterial } = useRawMaterialStore()
    const { post, patch, isPending } = useRequest()

    const { data: extraFieldSuggestions } = useGet<
        { key: string; value: string }[]
    >(API.EXTRA.RAW_EXTRA_FIELDS.INDEX)
    const suggestions = extraFieldSuggestions?.map((f) => f.key) ?? []

    const extraFieldsDefault: ExtraField[] =
        rawMaterial?.extra_fields ?
            Object.entries(rawMaterial.extra_fields).map(([key, value]) => ({
                key,
                value: String(value),
            }))
        :   []

    const form = useForm<Form>({
        defaultValues: {
            name: "",
            standard: "",
            mark: "",
            sku: "",
            width: null,
            thickness: null,
            description: "",
            extra_fields: [],
        },
        values:
            rawMaterial ?
                {
                    name: rawMaterial.name,
                    standard: rawMaterial.standard,
                    mark: rawMaterial.mark,
                    sku: rawMaterial.sku,
                    width: rawMaterial.width ?? null,
                    thickness: rawMaterial.thickness ?? null,
                    description: rawMaterial.description ?? "",
                    extra_fields: extraFieldsDefault,
                }
            :   undefined,
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "extra_fields",
    })

    const onSuccess = () => {
        invalidateByExactMatch([API.EXTRA.RAW_MATERIALS.INDEX])
        closeModal()
        toast.success(
            rawMaterial ?
                "Updated successfully"
            :   "Raw material added successfully",
        )
    }

    const onSubmit = form.handleSubmit((vals) => {
        const extra_fields: Record<string, string> = {}
        for (const f of vals.extra_fields) {
            if (f.key.trim()) extra_fields[f.key.trim()] = f.value
        }

        const payload = {
            name: vals.name,
            standard: vals.standard,
            mark: vals.mark,
            sku: vals.sku,
            width: vals.width ? Number(vals.width) : null,
            thickness: vals.thickness ? Number(vals.thickness) : null,
            description: vals.description,
            extra_fields,
        }

        if (rawMaterial) {
            patch(
                API.EXTRA.RAW_MATERIALS.ID.INDEX.replace(
                    "{id}",
                    String(rawMaterial.id),
                ),
                payload,
                { onSuccess },
            )
        } else {
            post(API.EXTRA.RAW_MATERIALS.INDEX, payload, { onSuccess })
        }
    })

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>
                {rawMaterial ? "Edit Raw Material" : "Add Raw Material"}
            </CardTitle>

            <UncontrolledInput methods={form} name="name" label="Name" />
            <UncontrolledInput
                methods={form}
                name="standard"
                label="Standard"
            />
            <UncontrolledInput methods={form} name="mark" label="Mark" />
            <UncontrolledInput methods={form} name="sku" label="SKU" />
            <UncontrolledInput
                methods={form}
                name="width"
                label="Ширина"
                type="number"
                step="any"
            />
            <UncontrolledInput
                methods={form}
                name="thickness"
                label="Толщина"
                type="number"
                step="any"
            />

            {/* Description – rich text */}
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
                submitName={rawMaterial ? t("common.save") : t("common.add")}
                loading={isPending}
            />
        </form>
    )
}
