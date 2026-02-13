import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import ControlledInput from "@/components/form/controlled-input"
import PhoneField from "@/components/form/phone-field"
import SelectField from "@/components/form/select-field"
import UncontrolledInput from "@/components/form/uncontrolled-input"
import { CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useAdminStore } from "../-hooks/use-admin-store"
import type { Admin } from "../-types"

export default function AdminAddEditModal() {
    return (
        <Modal
            modalKey="add-admin"
            title={null}
        >
            <AdminAddEdit />
        </Modal>
    )
}

interface Form extends Omit<Admin, "role"> {
    role: Admin["role"] | null
    password: string
    confirm_password: string
}

const adminOptions: { id: Admin["role"]; name: string }[] = [
    { id: "manager", name: "Manager" },
    { id: "delivery", name: "Delivery" },
    { id: "service", name: "Service" },
]

function AdminAddEdit() {
    const { closeModal } = useModal("add-admin")
    const { invalidateByExactMatch } = useRevalidate()
    const { admin } = useAdminStore()
    const { post, patch, isPending } = useRequest()
    const form = useForm<Form>({
        defaultValues: {
            first_name: "",
            last_name: "",
            phone_number: "",
            role: "manager",
            confirm_password: "",
        },
        values:
            admin ?
                { ...admin, password: "", confirm_password: "" }
                : undefined,
    })
    const onSuccess = () => {
        invalidateByExactMatch([API.ADMIN.USERS.INDEX])
        closeModal()
        toast.success(
            admin ? "Updated successfully" : "User added successfully",
        )
    }

    const onSubmit = form.handleSubmit((vals) => {
        const payload = {
            ...vals,
            password: vals.password || undefined,
            confirm_password: undefined,
        }
        if (vals.confirm_password !== vals.password) {
            form.setError("confirm_password", {
                message: "Password and confirm password are not compatible!",
            })
            return
        }
        if (admin) {
            patch(
                API.ADMIN.USERS.ID.INDEX.replace("{id}", String(admin.id)),
                payload,
                {
                    onSuccess,
                },
            )
        } else {
            post(API.ADMIN.USERS.INDEX, payload, {
                onSuccess: onSuccess,
            })
        }
    })

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {<CardTitle>{admin ? "Edit" : "Add"}</CardTitle>}
            <UncontrolledInput
                methods={form}
                name="first_name"
                label="First name"
            />
            <UncontrolledInput
                methods={form}
                name="last_name"
                label="Last name"
            />
            <PhoneField
                methods={form}
                name="phone_number"
                label="Phone number"
            />
            <SelectField
                methods={form}
                name="role"
                options={adminOptions}
                label="Role"
                placeholder="Select role"
            />
            <ControlledInput
                methods={form}
                name="password"
                label="Password"
                type="password"
                optional={!!admin}
            />
            <ControlledInput
                methods={form}
                name="confirm_password"
                label="Confirm password"
                showError
                type="password"
                optional={!!admin}
            />
            <FormAction
                submitName={admin ? "Save" : "Add"}
                loading={isPending}
            />
        </form>
    )
}
