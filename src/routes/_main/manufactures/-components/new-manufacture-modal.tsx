import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import { CardTitle } from "@/components/ui/card"
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
        <Modal modalKey="new-manufacture" title={null}>
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
    const [rawItemDetailId, setRawItemDetailId] = useState("")
    const [stock, setStock] = useState("")

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
                raw_item_detail_id: Number(rawItemDetailId),
                stock: Number(stock),
                status: "ready",
            },
            { onSuccess },
        )
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4 min-w-[380px]">
            <CardTitle>New manufacture</CardTitle>

            {/* Category */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Category</label>
                <select
                    className="border rounded px-3 py-2 text-sm bg-background"
                    value={categoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    required
                >
                    <option value="">Select</option>
                    {categoryOptions.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Sub category */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Sub category</label>
                <select
                    className="border rounded px-3 py-2 text-sm bg-background"
                    value={subCategoryId}
                    onChange={(e) => handleSubCategoryChange(e.target.value)}
                    disabled={!categoryId}
                    required
                >
                    <option value="">Select</option>
                    {subCategoryOptions.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Product */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Product</label>
                <select
                    className="border rounded px-3 py-2 text-sm bg-background"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    disabled={!subCategoryId}
                    required
                >
                    <option value="">Select</option>
                    {productOptions.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Raw item detail */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Raw Material</label>
                <select
                    className="border rounded px-3 py-2 text-sm bg-background"
                    value={rawItemDetailId}
                    onChange={(e) => setRawItemDetailId(e.target.value)}
                    required
                >
                    <option value="">Select</option>
                    {rawItemDetailOptions.map((r) => (
                        <option key={r.id} value={r.id}>
                            {r.contract_number ?? r.name ?? `#${r.id}`}
                        </option>
                    ))}
                </select>
            </div>

            {/* Stock */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Stock</label>
                <input
                    type="number"
                    placeholder="0"
                    className="border rounded px-3 py-2 text-sm"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    min={0}
                />
            </div>

            <FormAction submitName="Create" loading={isPending} />
        </form>
    )
}
