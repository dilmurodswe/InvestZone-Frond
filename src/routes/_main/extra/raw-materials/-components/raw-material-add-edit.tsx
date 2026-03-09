import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import UncontrolledInput from "@/components/form/uncontrolled-input"
import { CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useRawMaterialStore } from "../-hooks/use-raw-material-store"
import type { RawMaterial } from "../-types"
import { API } from "@/lib/constants/api-endpoints"

export default function RawMaterialAddEditModal() {
    return (
        <Modal modalKey="add-raw-material" title={null}>
            <RawMaterialAddEdit />
        </Modal>
    )
}

type Form = Omit<RawMaterial, "id">

function RawMaterialAddEdit() {
    const { closeModal } = useModal("add-raw-material")
    const { invalidateByExactMatch } = useRevalidate()
    const { rawMaterial } = useRawMaterialStore()
    const { post, patch, isPending } = useRequest()

    const form = useForm<Form>({
        defaultValues: { name: "", standard: "", mark: "" },
        values: rawMaterial
            ? {
                name: rawMaterial.name,
                standard: rawMaterial.standard,
                mark: rawMaterial.mark,
            }
            : undefined,
    })

    const onSuccess = () => {
        invalidateByExactMatch([API.EXTRA.RAW_MATERIALS.INDEX])
        closeModal()
        toast.success(
            rawMaterial ? "Updated successfully" : "Raw material added successfully",
        )
    }

    const onSubmit = form.handleSubmit((vals) => {
        if (rawMaterial) {
            patch(API.EXTRA.RAW_MATERIALS.ID.INDEX.replace("{id}", String(rawMaterial.id)), vals, { onSuccess })
        } else {
            post(API.EXTRA.RAW_MATERIALS.INDEX, vals, { onSuccess })
        }
    })

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>
                {rawMaterial ? "Edit Raw Material" : "Add Raw Material"}
            </CardTitle>
            <UncontrolledInput methods={form} name="name" label="Name" />
            <UncontrolledInput methods={form} name="standard" label="Standard" />
            <UncontrolledInput methods={form} name="mark" label="Mark" />
            <FormAction
                submitName={rawMaterial ? "Save" : "Add"}
                loading={isPending}
            />
        </form>
    )
}