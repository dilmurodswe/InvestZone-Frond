import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import UncontrolledInput from "@/components/form/uncontrolled-input"
import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"
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
import { Controller, useFieldArray, useForm } from "react-hook-form"
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

// ─── Main form ────────────────────────────────────────────────────────────────
function RawMaterialAddEdit() {
    const { closeModal } = useModal("add-raw-material")
    const { invalidateByExactMatch } = useRevalidate()
    const { rawMaterial } = useRawMaterialStore()
    const { post, patch, isPending } = useRequest()

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
            description: "",
            extra_fields: [],
        },
        values:
            rawMaterial ?
                {
                    name: rawMaterial.name,
                    standard: rawMaterial.standard,
                    mark: rawMaterial.mark,
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
                        <div key={field.id} className="flex items-center gap-2">
                            <input
                                {...form.register(`extra_fields.${index}.key`)}
                                placeholder="Key"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                            <input
                                {...form.register(
                                    `extra_fields.${index}.value`,
                                )}
                                placeholder="Value"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <FormAction
                submitName={rawMaterial ? "Save" : "Add"}
                loading={isPending}
            />
        </form>
    )
}
