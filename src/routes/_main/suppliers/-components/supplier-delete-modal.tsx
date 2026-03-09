import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { toast } from "sonner"
import { useSupplierStore } from "../-hooks/use-supplier-store"

export default function SupplierDeleteModal() {
    return (
        <Modal
            modalKey="delete-supplier"
        >
            <SupplierDelete />
        </Modal>
    )
}

function SupplierDelete() {
    const { closeModal } = useModal("delete-supplier")
    const { invalidateByExactMatch } = useRevalidate()
    const { supplier } = useSupplierStore()
    const { remove, isPending } = useRequest()

    console.log("SupplierDelete rendered, closeModal function exists:", !!closeModal)

    const onSuccess = () => {
        console.log("✅ onSuccess called - before closeModal")
        invalidateByExactMatch([API.SUPPLIER.USERS.INDEX])
        closeModal()
        console.log("✅ after closeModal called")
        toast.success("Supplier deleted successfully")
    }
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (supplier) {
            remove(
                API.SUPPLIER.USERS.ID.INDEX.replace("{id}", String(supplier.id)),
                undefined,
                { onSuccess }
            )
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>Delete Supplier</CardTitle>
            <CardDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                    {supplier?.full_name}
                </span>
                ? This action cannot be undone.
            </CardDescription>
            <FormAction
                submitName="Delete"
                loading={isPending}

            />
        </form>
    )
}