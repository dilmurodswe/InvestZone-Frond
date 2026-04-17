import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import SelectField from "@/components/form/select-field" // ← import
import UncontrolledInput from "@/components/form/uncontrolled-input"
import { CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useCategoryStore } from "../-hooks/use-category-store"
import type { Category } from "../-types"

export default function CategoryAddEditModal() {
    return (
        <Modal modalKey="add-category" title={null}>
            <CategoryAddEdit />
        </Modal>
    )
}

type Form = Omit<Category, "id">

// ← qo'shildi
const typeOptions = [
    { name: "Truba", id: "truba" },
    { name: "Profil", id: "profil" },
]

function CategoryAddEdit() {
    const { closeModal } = useModal("add-category")
    const { invalidateByExactMatch } = useRevalidate()
    const { category } = useCategoryStore()
    const { post, patch, isPending } = useRequest()
    const form = useForm<Form>({
        defaultValues: { name: "", type: "truba" }, // ← type default
        values:
            category ?
                { name: category.name, type: category.type } // ← type value
            :   undefined,
    })

    const onSuccess = () => {
        invalidateByExactMatch([API.EXTRA.CATEGORIES.INDEX])
        closeModal()
        toast.success(
            category ? "Updated successfully" : "Category added successfully",
        )
    }

    const onSubmit = form.handleSubmit((vals) => {
        if (category) {
            patch(
                API.EXTRA.CATEGORIES.ID.INDEX.replace(
                    "{id}",
                    String(category.id),
                ),
                vals,
                { onSuccess },
            )
        } else {
            post(API.EXTRA.CATEGORIES.INDEX, vals, { onSuccess })
        }
    })

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>{category ? "Edit Category" : "Add Category"}</CardTitle>
            <UncontrolledInput
                methods={form}
                name="name"
                label="Category name"
            />
            {/* ← qo'shildi */}
            <SelectField
                methods={form}
                name="type"
                options={typeOptions}
                label="Type"
                placeholder="Select type"
            />
            <FormAction
                submitName={category ? "Save" : "Add"}
                loading={isPending}
            />
        </form>
    )
}
