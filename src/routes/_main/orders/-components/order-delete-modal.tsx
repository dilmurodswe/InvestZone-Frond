import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { toast } from "sonner"
import { useOrderStore } from "../-hooks/use-order-store"

export default function OrderDeleteModal() {
    return (
        <Modal modalKey="delete-order">
            <OrderDelete />
        </Modal>
    )
}

function OrderDelete() {
    const { closeModal } = useModal("delete-order")
    const { invalidateByExactMatch } = useRevalidate()
    const { order } = useOrderStore()
    const { remove, isPending } = useRequest()

    const onSuccess = () => {
        invalidateByExactMatch([API.ORDERS.INDEX])
        closeModal()
        toast.success("Order deleted successfully")
    }

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (order) {
            remove(
                API.ORDERS.ID.INDEX.replace("{id}", String(order.id)),
                undefined,
                { onSuccess },
            )
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>Delete Order</CardTitle>
            <CardDescription>
                Are you sure you want to delete order{" "}
                <span className="font-semibold">#{order?.id}</span>? This action
                cannot be undone.
            </CardDescription>
            <FormAction submitName="Delete" loading={isPending} />
        </form>
    )
}
