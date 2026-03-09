import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { toast } from "sonner"
import { useClientStore } from "../-hooks/use-client-store"

export default function ClientDeleteModal() {
    return (
        <Modal
            modalKey="delete-client"
        >
            <ClientDelete />
        </Modal>
    )
}

function ClientDelete() {
    const { closeModal } = useModal("delete-client")
    const { invalidateByExactMatch } = useRevalidate()
    const { client } = useClientStore()
    const { remove, isPending } = useRequest()

    console.log("ClientDelete rendered, closeModal function exists:", !!closeModal)

    const onSuccess = () => {
        console.log("✅ onSuccess called - before closeModal")
        invalidateByExactMatch([API.CLIENT.USERS.INDEX])
        closeModal()
        console.log("✅ after closeModal called")
        toast.success("Client deleted successfully")
    }
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (client) {
            remove(
                API.CLIENT.USERS.ID.INDEX.replace("{id}", String(client.id)),
                undefined,
                { onSuccess }
            )
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>Delete Client</CardTitle>
            <CardDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                    {client?.full_name}
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