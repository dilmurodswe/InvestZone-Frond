import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { useDemandStore } from "../-hooks/use-demand-store"

export default function DemandDeleteModal() {
    return (
        <Modal modalKey="delete-demand">
            <DemandDelete />
        </Modal>
    )
}

function DemandDelete() {
    const { t } = useTranslation()
    const { closeModal } = useModal("delete-demand")
    const { invalidateByExactMatch } = useRevalidate()
    const { demand } = useDemandStore()
    const { remove, isPending } = useRequest()

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!demand) return
        remove(
            API.DEMANDS.ID.INDEX.replace("{id}", String(demand.id)),
            undefined,
            {
                onSuccess: () => {
                    // Deleting a shipment gives its quantity back to the order.
                    invalidateByExactMatch([API.DEMANDS.INDEX])
                    invalidateByExactMatch([API.ORDERS.INDEX])
                    closeModal()
                    toast.success(t("common.deleteEntity", {
                        entity: t("entity.demand"),
                    }))
                },
            },
        )
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>
                {t("common.deleteEntity", { entity: t("entity.demand") })}
            </CardTitle>
            <CardDescription>{t("common.deleteConfirm")}</CardDescription>
            <FormAction submitName={t("common.delete")} loading={isPending} />
        </form>
    )
}
