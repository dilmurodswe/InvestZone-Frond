import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { toast } from "sonner"
import { useSubCategoryStore } from "../-hooks/use-subcategory-store"
import { API } from "@/lib/constants/api-endpoints"

export default function SubCategoryDeleteModal() {
    return (
        <Modal modalKey="delete-subcategory">
            <SubCategoryDelete />
        </Modal>
    )
}

function SubCategoryDelete() {
    const { closeModal } = useModal("delete-subcategory")
    const { invalidateByExactMatch } = useRevalidate()
    const { subCategory } = useSubCategoryStore()
    const { remove, isPending } = useRequest()

    const onSuccess = () => {
        invalidateByExactMatch([API.EXTRA.SUBCATEGORIES.INDEX])
        closeModal()
        toast.success("Subcategory deleted successfully")
    }

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (subCategory) {
            remove(API.EXTRA.SUBCATEGORIES.ID.INDEX.replace("{id}", String(subCategory.id)), undefined, { onSuccess })
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>Delete Subcategory</CardTitle>
            <CardDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold">{subCategory?.name}</span>? This
                action cannot be undone.
            </CardDescription>
            <FormAction submitName="Delete" loading={isPending} />
        </form>
    )
}