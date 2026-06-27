import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { useProductStore } from "../-hooks/use-product-store"

export default function ProductDeleteModal() {
    return (
        <Modal modalKey="delete-product">
            <ProductDelete />
        </Modal>
    )
}

function ProductDelete() {
    const { t } = useTranslation()
    const { closeModal } = useModal("delete-product")
    const { invalidateByExactMatch } = useRevalidate()
    const { product } = useProductStore()
    const { remove, isPending } = useRequest()

    const onSuccess = () => {
        invalidateByExactMatch([API.EXTRA.PRODUCTS.INDEX])
        closeModal()
        toast.success("Product deleted successfully")
    }

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (product) {
            remove(
                API.EXTRA.PRODUCTS.ID.INDEX.replace("{id}", String(product.id)),
                undefined,
                { onSuccess },
            )
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>Delete Product</CardTitle>
            <CardDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold">{product?.name}</span>? This
                action cannot be undone.
            </CardDescription>
            <FormAction submitName={t("common.delete")} loading={isPending} />
        </form>
    )
}
