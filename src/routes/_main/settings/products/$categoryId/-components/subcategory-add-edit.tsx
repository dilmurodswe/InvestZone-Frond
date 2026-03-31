import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import UncontrolledInput from "@/components/form/uncontrolled-input"
import { CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { useParams } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useSubCategoryStore } from "../-hooks/use-subcategory-store"
import type { SubCategory } from "../../-types"

export default function SubCategoryAddEditModal() {
    return (
        <Modal modalKey="add-subcategory" title={null}>
            <SubCategoryAddEdit />
        </Modal>
    )
}

type Form = Omit<SubCategory, "id">

function SubCategoryAddEdit() {
    const { closeModal } = useModal("add-subcategory")
    const { invalidateByExactMatch } = useRevalidate()
    const { subCategory } = useSubCategoryStore()
    const { categoryId } = useParams({ strict: false })
    const { post, patch, isPending } = useRequest()

    const form = useForm<Form>({
        defaultValues: {
            name: "",
            parent: Number(categoryId),
        },
        values:
            subCategory ?
                { name: subCategory.name, parent: subCategory.parent }
            :   { name: "", parent: Number(categoryId) },
    })

    const onSuccess = () => {
        invalidateByExactMatch([API.EXTRA.SUBCATEGORIES.INDEX])
        closeModal()
        toast.success(
            subCategory ?
                "Updated successfully"
            :   "Subcategory added successfully",
        )
    }

    const onSubmit = form.handleSubmit((vals) => {
        if (subCategory) {
            patch(
                API.EXTRA.SUBCATEGORIES.ID.INDEX.replace(
                    "{id}",
                    String(subCategory.id),
                ),
                vals,
                { onSuccess },
            )
        } else {
            post(API.EXTRA.SUBCATEGORIES.INDEX, vals, { onSuccess })
        }
    })

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>
                {subCategory ? "Edit Subcategory" : "Add Subcategory"}
            </CardTitle>
            <UncontrolledInput
                methods={form}
                name="name"
                label="Subcategory name"
            />
            <FormAction
                submitName={subCategory ? "Save" : "Add"}
                loading={isPending}
            />
        </form>
    )
}
