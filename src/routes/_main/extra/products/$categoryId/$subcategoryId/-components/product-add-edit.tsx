import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import UncontrolledInput from "@/components/form/uncontrolled-input"
import { CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { useParams } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useProductStore } from "../-hooks/use-product-store"
import type { Product } from "../../../-types"
import { API } from "@/lib/constants/api-endpoints"

export default function ProductAddEditModal() {
    return (
        <Modal modalKey="add-product" title={null}>
            <ProductAddEdit />
        </Modal>
    )
}

type Form = Omit<Product, "id">

function ProductAddEdit() {
    const { closeModal } = useModal("add-product")
    const { invalidateByExactMatch } = useRevalidate()
    const { product } = useProductStore()
    const { categoryId, subcategoryId } = useParams({ strict: false })
    const { post, patch, isPending } = useRequest()

    const form = useForm<Form>({
        defaultValues: {
            name: "",
            category: Number(categoryId),
            sub_category: Number(subcategoryId),
            code: 0,
            articul: "",
            price: 0,
        },
        values: product
            ? {
                name: product.name,
                category: product.category,
                sub_category: product.sub_category,
                code: product.code,
                articul: product.articul,
                price: product.price,
            }
            : undefined,
    })

    const onSuccess = () => {
        invalidateByExactMatch([API.EXTRA.PRODUCTS.INDEX])
        closeModal()
        toast.success(product ? "Updated successfully" : "Product added successfully")
    }

    const onSubmit = form.handleSubmit((vals) => {
        if (product) {
            patch(API.EXTRA.PRODUCTS.ID.INDEX.replace("{id}", String(product.id)), vals, { onSuccess })
        } else {
            post(API.EXTRA.PRODUCTS.INDEX, vals, { onSuccess })
        }
    })

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>{product ? "Edit Product" : "Add Product"}</CardTitle>
            <UncontrolledInput methods={form} name="name" label="Product name" />
            <UncontrolledInput methods={form} name="articul" label="Articul" />
            <UncontrolledInput methods={form} name="code" label="Product code" type="number" />
            <UncontrolledInput methods={form} name="price" label="Price" type="number" />

            <FormAction submitName={product ? "Save" : "Add"} loading={isPending} />
        </form>
    )
}