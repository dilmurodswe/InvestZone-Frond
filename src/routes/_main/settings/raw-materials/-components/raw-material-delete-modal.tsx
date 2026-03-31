import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { toast } from "sonner"
import { useRawMaterialStore } from "../-hooks/use-raw-material-store"

export default function RawMaterialDeleteModal() {
    return (
        <Modal modalKey="delete-raw-material">
            <RawMaterialDelete />
        </Modal>
    )
}

function RawMaterialDelete() {
    const { closeModal } = useModal("delete-raw-material")
    const { invalidateByExactMatch } = useRevalidate()
    const { rawMaterial } = useRawMaterialStore()
    const { remove, isPending } = useRequest()

    const onSuccess = () => {
        invalidateByExactMatch([API.EXTRA.RAW_MATERIALS.INDEX])
        closeModal()
        toast.success("Raw material deleted successfully")
    }

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (rawMaterial) {
            remove(
                API.EXTRA.RAW_MATERIALS.ID.INDEX.replace(
                    "{id}",
                    String(rawMaterial.id),
                ),
                undefined,
                { onSuccess },
            )
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>Delete Raw Material</CardTitle>
            <CardDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold">{rawMaterial?.name}</span>? This
                action cannot be undone.
            </CardDescription>
            <FormAction submitName="Delete" loading={isPending} />
        </form>
    )
}
