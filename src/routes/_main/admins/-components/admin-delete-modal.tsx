import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { toast } from "sonner"
import { useAdminStore } from "../-hooks/use-admin-store"

export default function AdminDeleteModal() {
    return (
        <Modal
            modalKey="delete-admin"
        >
            <AdminDelete />
        </Modal>
    )
}

function AdminDelete() {
    const { closeModal } = useModal("delete-admin")
    const { invalidateByExactMatch } = useRevalidate()
    const { admin } = useAdminStore()
    const { remove, isPending } = useRequest()

    console.log("AdminDelete rendered, closeModal function exists:", !!closeModal)

    const onSuccess = () => {
        console.log("✅ onSuccess called - before closeModal")
        invalidateByExactMatch([API.ADMIN.USERS.INDEX])
        closeModal()
        console.log("✅ after closeModal called")
        toast.success("Admin deleted successfully")
    }
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (admin) {
            remove(
                API.ADMIN.USERS.ID.INDEX.replace("{id}", String(admin.id)),
                undefined,
                { onSuccess }
            )
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>Delete Admin</CardTitle>
            <CardDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                    {admin?.first_name} {admin?.last_name}
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