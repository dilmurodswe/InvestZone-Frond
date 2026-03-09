import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { toast } from "sonner"
import { useCategoryStore } from "../-hooks/use-category-store"
import { API } from "@/lib/constants/api-endpoints"

export default function CategoryDeleteModal() {
    return (
        <Modal modalKey="delete-category">
            <CategoryDelete />
        </Modal>
    )
}

function CategoryDelete() {
    const { closeModal } = useModal("delete-category")
    const { invalidateByExactMatch } = useRevalidate()
    const { category } = useCategoryStore()
    const { remove, isPending } = useRequest()

    const onSuccess = () => {
        invalidateByExactMatch([API.EXTRA.CATEGORIES.INDEX])
        closeModal()
        toast.success("Category deleted successfully")
    }

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (category) {
            remove(API.EXTRA.CATEGORIES.ID.INDEX.replace("{id}", String(category.id)), undefined, { onSuccess })
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>Delete Category</CardTitle>
            <CardDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold">{category?.name}</span>? This action
                cannot be undone.
            </CardDescription>
            <FormAction submitName="Delete" loading={isPending} />
        </form>
    )
}