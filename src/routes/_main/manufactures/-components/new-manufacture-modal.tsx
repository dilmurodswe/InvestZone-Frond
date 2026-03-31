import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import { CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { useState } from "react"
import { toast } from "sonner"
import {
    useCategoriesSelectQuery,
    useProductsSelectQuery,
    useRawItemDetailsSelectQuery,
    useSubCategoriesSelectQuery,
} from "../-hooks/use-select-queries"

export default function NewManufactureModal() {
    return (
        <Modal
            modalKey="new-manufacture"
            title={null}
            wrapperClassname="md:w-[860px]! md:max-w-none"
            className="min-w-[820px]!"
        >
            <NewManufactureForm />
        </Modal>
    )
}

function NewManufactureForm() {
    const { closeModal } = useModal("new-manufacture")
    const { invalidateByExactMatch } = useRevalidate()
    const { post, isPending } = useRequest()

    const [categoryId, setCategoryId] = useState("")
    const [subCategoryId, setSubCategoryId] = useState("")
    const [productId, setProductId] = useState("")
    const [stock, setStock] = useState("")
    const [selectedRawIds, setSelectedRawIds] = useState<number[]>([])

    const { categoryOptions } = useCategoriesSelectQuery()
    const { subCategoryOptions } = useSubCategoriesSelectQuery(
        categoryId ? Number(categoryId) : undefined,
    )
    const { productOptions } = useProductsSelectQuery(
        subCategoryId ? Number(subCategoryId) : undefined,
    )
    const { rawItemDetailOptions } = useRawItemDetailsSelectQuery()

    const handleCategoryChange = (val: string) => {
        setCategoryId(val)
        setSubCategoryId("")
        setProductId("")
    }

    const handleSubCategoryChange = (val: string) => {
        setSubCategoryId(val)
        setProductId("")
    }

    const toggleRaw = (id: number) => {
        setSelectedRawIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        )
    }

    const onSuccess = () => {
        invalidateByExactMatch([API.MANUFACTURES.INDEX])
        closeModal()
        toast.success("Created successfully")
    }

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(
            API.MANUFACTURES.INDEX,
            {
                category_id: Number(categoryId),
                sub_category_id: Number(subCategoryId),
                product_id: Number(productId),
                raw_item_detail_ids: selectedRawIds,
                stock: Number(stock),
                status: "ready",
            },
            { onSuccess },
        )
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <CardTitle>New manufacture</CardTitle>

            {/* Top row — 4 selects + quantity */}
            <div className="grid grid-cols-4 gap-3 items-end">
                {/* Category */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Category</label>
                    <Select
                        value={categoryId}
                        onValueChange={handleCategoryChange}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            {categoryOptions.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Sub category */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Sub category</label>
                    <Select
                        value={subCategoryId}
                        onValueChange={handleSubCategoryChange}
                        disabled={!categoryId}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            {subCategoryOptions.map((s) => (
                                <SelectItem key={s.id} value={String(s.id)}>
                                    {s.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Product */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Product</label>
                    <Select
                        value={productId}
                        onValueChange={setProductId}
                        disabled={!subCategoryId}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            {productOptions.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>
                                    {p.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Quantity */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Quantity</label>
                    <input
                        type="number"
                        placeholder="0"
                        className="w-full border rounded-md px-3 py-2 text-sm bg-background h-9"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        required
                        min={0}
                    />
                </div>
            </div>

            {/* Raw Material table */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Raw Material</label>
                    {selectedRawIds.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                            {selectedRawIds.length} selected
                        </span>
                    )}
                </div>

                <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-y-auto max-h-[280px]">
                        <table className="w-full text-sm border-collapse">
                            <thead className="sticky top-0 bg-muted/60 backdrop-blur-sm z-10">
                                <tr className="border-b">
                                    <th className="w-10 px-3 py-2" />
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                                        Contract #
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                                        Supplier
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                                        Material
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                                        Weight
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                                        Netto
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                                        Inner
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                                        Outer
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                                        Mark
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                                        Plank
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {rawItemDetailOptions.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className="text-center py-6 text-sm text-muted-foreground"
                                        >
                                            No data
                                        </td>
                                    </tr>
                                )}
                                {rawItemDetailOptions.map((r) => {
                                    const checked = selectedRawIds.includes(
                                        r.id,
                                    )
                                    return (
                                        <tr
                                            key={r.id}
                                            className={`border-b last:border-0 cursor-pointer transition-colors hover:bg-muted/40 ${checked ? "bg-primary/5" : ""}`}
                                            onClick={() => toggleRaw(r.id)}
                                        >
                                            <td
                                                className="px-3 py-2"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <Checkbox checked={checked} />
                                            </td>
                                            <td className="px-3 py-2 text-sm">
                                                {r.contract_number ?? "—"}
                                            </td>
                                            <td className="px-3 py-2 text-sm">
                                                {r.supplier ?? "—"}
                                            </td>
                                            <td className="px-3 py-2 text-sm">
                                                {r.raw_material_name ?? "—"}
                                            </td>
                                            <td className="px-3 py-2 text-sm">
                                                {r.weight ?? "—"}
                                            </td>
                                            <td className="px-3 py-2 text-sm">
                                                {r.netto ?? "—"}
                                            </td>
                                            <td className="px-3 py-2 text-sm">
                                                {r.inner_size ?? "—"}
                                            </td>
                                            <td className="px-3 py-2 text-sm">
                                                {r.outer_size ?? "—"}
                                            </td>
                                            <td className="px-3 py-2 text-sm">
                                                {r.mark ?? "—"}
                                            </td>
                                            <td className="px-3 py-2 text-sm">
                                                {r.plank ?? "—"}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <FormAction submitName="Create" loading={isPending} />
        </form>
    )
}
