import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import UncontrolledInput from "@/components/form/uncontrolled-input"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { useFcStore } from "../-hooks/use-fc-store"

type Form = { name: string }
type Level = "category" | "subcategory"

/**
 * Shared add/edit modal for both levels. `level` picks the endpoint;
 * for subcategories the selected category is sent as `parent`.
 */
function AddEditModal({ level, modalKey }: { level: Level; modalKey: string }) {
    const { t } = useTranslation()
    const { closeModal } = useModal(modalKey)
    const { invalidateByPatternMatch } = useRevalidate()
    const { kind, selectedCategory, editing, setEditing } = useFcStore()
    const { post, patch, isPending } = useRequest()

    const endpoint =
        level === "category" ?
            API.FINANCE.CATEGORIES
        :   API.FINANCE.SUBCATEGORIES

    const entity =
        level === "category" ? t("entity.category") : t("entity.subcategory")

    const form = useForm<Form>({
        values: { name: editing?.name ?? "" },
    })

    const onSuccess = () => {
        invalidateByPatternMatch([API.FINANCE.CATEGORIES.INDEX])
        invalidateByPatternMatch([API.FINANCE.SUBCATEGORIES.INDEX])
        setEditing(null)
        closeModal()
        toast.success(
            editing ?
                t("common.updatedSuccessfully")
            :   t("common.addedSuccessfully"),
        )
    }

    const onSubmit = form.handleSubmit(({ name }) => {
        const payload =
            level === "category" ?
                { name, kind }
            :   { name, parent: selectedCategory?.id }

        if (editing) {
            patch(
                endpoint.ID.INDEX.replace("{id}", String(editing.id)),
                payload,
                { onSuccess },
            )
        } else {
            post(endpoint.INDEX, payload, { onSuccess })
        }
    })

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>
                {editing ?
                    t("common.editEntity", { entity })
                :   t("common.addEntity", { entity })}
            </CardTitle>
            <UncontrolledInput
                methods={form}
                name="name"
                label={t("table.name")}
            />
            <FormAction
                submitName={editing ? t("common.save") : t("common.add")}
                loading={isPending}
            />
        </form>
    )
}

export function CategoryAddEditModal() {
    return (
        <Modal modalKey="fc-category" title={null}>
            <AddEditModal level="category" modalKey="fc-category" />
        </Modal>
    )
}

export function SubcategoryAddEditModal() {
    return (
        <Modal modalKey="fc-subcategory" title={null}>
            <AddEditModal level="subcategory" modalKey="fc-subcategory" />
        </Modal>
    )
}

function DeleteModal({ level, modalKey }: { level: Level; modalKey: string }) {
    const { t } = useTranslation()
    const { closeModal } = useModal(modalKey)
    const { invalidateByPatternMatch } = useRevalidate()
    const { editing, setEditing } = useFcStore()
    const { remove, isPending } = useRequest()

    const endpoint =
        level === "category" ?
            API.FINANCE.CATEGORIES
        :   API.FINANCE.SUBCATEGORIES

    const entity =
        level === "category" ? t("entity.category") : t("entity.subcategory")

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!editing) return
        remove(
            endpoint.ID.INDEX.replace("{id}", String(editing.id)),
            undefined,
            {
                onSuccess: () => {
                    invalidateByPatternMatch([API.FINANCE.CATEGORIES.INDEX])
                    invalidateByPatternMatch([API.FINANCE.SUBCATEGORIES.INDEX])
                    setEditing(null)
                    closeModal()
                    toast.success(t("common.deletedSuccessfully"))
                },
            },
        )
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>{t("common.deleteEntity", { entity })}</CardTitle>
            <CardDescription>
                {t("finCat.deleteQuestion", { name: editing?.name ?? "" })}
            </CardDescription>
            <FormAction submitName={t("common.delete")} loading={isPending} />
        </form>
    )
}

export function CategoryDeleteModal() {
    return (
        <Modal modalKey="fc-category-delete">
            <DeleteModal level="category" modalKey="fc-category-delete" />
        </Modal>
    )
}

export function SubcategoryDeleteModal() {
    return (
        <Modal modalKey="fc-subcategory-delete">
            <DeleteModal level="subcategory" modalKey="fc-subcategory-delete" />
        </Modal>
    )
}
