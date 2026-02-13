import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import ControlledDatePicker from "@/components/form/controlled-datepicker"
import NumberField from "@/components/form/number-field"
import PhoneField from "@/components/form/phone-field"
import UncontrolledInput from "@/components/form/uncontrolled-input"
import { CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { getNumber } from "@/lib/utils/get-number"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useClientStore } from "../-hooks/use-client-store"
import type { Client } from "../-types"

export default function ClientAddEditModal() {
    return (
        <Modal>
            <Content />
        </Modal>
    )
}

function Content() {
    const { closeModal } = useModal()
    const { invalidateByExactMatch } = useRevalidate()
    const { client } = useClientStore()
    const { post, patch, isPending } = useRequest()
    const form = useForm<Client>({
        defaultValues: {
            first_name: "",
            last_name: "",
            phone_number: "",
            passport_id: "",
            balance: "0",
            birth_date: "",
            company: "",
            date_joined: "",
        },
        values: client ? { ...client } : undefined,
    })
    const onSuccess = () => {
        invalidateByExactMatch([API.CLIENT.USERS.INDEX])
        closeModal()
        toast.success(
            client ? "Updated successfully" : "User added successfully",
        )
    }

    const onSubmit = form.handleSubmit((vals) => {
        const payload = {
            ...vals,
            passport_id: vals.passport_id?.toUpperCase() || undefined,
            balance: getNumber(vals.balance),
        }
        if (client) {
            patch(
                API.CLIENT.USERS.ID.INDEX.replace("{id}", String(client.id)),
                payload,
                {
                    onSuccess,
                },
            )
        } else {
            post(API.CLIENT.USERS.INDEX, payload, {
                onSuccess: onSuccess,
            })
        }
    })

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {<CardTitle>{client ? "Edit" : "Add"}</CardTitle>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <UncontrolledInput
                    methods={form}
                    name="passport_id"
                    label="Passport series"
                    optional
                    className="uppercase"
                />
            </div>
            <ControlledDatePicker
                methods={form}
                name="birth_date"
                label="Birth date"
            />
            <UncontrolledInput
                methods={form}
                name="company"
                label="Company"
                optional
            />
            <NumberField
                methods={form}
                name="balance"
                label="Balance"
                optional
                allowNegative
            />
            <FormAction
                submitName={client ? "Save" : "Add"}
                loading={isPending}
            />
        </form>
    )
}
