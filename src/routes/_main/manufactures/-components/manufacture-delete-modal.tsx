import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { toast } from "sonner"
import { useManufactureStore } from "../-hooks/use-manufacture-store"

export default function ManufactureDeleteModal() {
    return (
        <Modal modalKey="delete-manufacture">
            <ManufactureDelete />
        </Modal>
    )
}

function ManufactureDelete() {
    const { closeModal } = useModal("delete-manufacture")
    const { invalidateByExactMatch } = useRevalidate()
    const { manufacture } = useManufactureStore()
    const { remove, isPending } = useRequest()

    const onSuccess = () => {
        invalidateByExactMatch([API.MANUFACTURES.INDEX])
        closeModal()
        toast.success("Deleted successfully")
    }

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (manufacture) {
            remove(
                API.MANUFACTURES.ID.replace("{id}", String(manufacture.id)),
                { onSuccess },
            )
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>Delete Manufacture</CardTitle>
            <CardDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold">{manufacture?.product}</span>?
                This action cannot be undone.
            </CardDescription>
            <FormAction submitName="Delete" loading={isPending} />
        </form>
    )
}
