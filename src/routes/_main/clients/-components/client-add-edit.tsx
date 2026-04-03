import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import NumberField from "@/components/form/number-field"
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
import { useClientStore } from "../-hooks/use-client-store"
import type { Client, CustomerType } from "../-types"

export default function ClientAddEditModal() {
    return (
        <Modal
            wrapperClassname="md:w-[900px]! md:max-w-none"
            className="min-w-[860px]!"
        >
            <Content />
        </Modal>
    )
}
const customerTypeOptions: { id: CustomerType; name: string }[] = [
    { id: "LLC", name: "LLC" },
    { id: "INDIV", name: "INDIV" },
    { id: "TD", name: "TD" },
]

function Content() {
    const { closeModal } = useModal()
    const { invalidateByExactMatch } = useRevalidate()
    const { client } = useClientStore()
    const { post, patch, isPending } = useRequest()

    const form = useForm<Client>({
        defaultValues: {
            company_name: "",
            customer_type: null,
            activity_field: "",
            company_phone: "",
            company_email: "",
            region_address: "",
            exact_address: "",
            legal_address: "",
            inn: "",
            official_name: "",
            bank_name: "",
            bank_address: "",
            mfo_code: "",
            account_number: "",
            okpo_code: "",
            position: "",
            full_name: "",
            phone: "",
            email: "",
            notes: "",
            balance: null,
        },
        values: client ? { ...client } : undefined,
    })

    const onSuccess = () => {
        invalidateByExactMatch([API.CLIENT.USERS.INDEX])
        closeModal()
        toast.success(
            client ? "Updated successfully" : "Client added successfully",
        )
    }

    const onSubmit = form.handleSubmit((vals) => {
        const payload = { ...vals }
        if (client) {
            patch(
                API.CLIENT.USERS.ID.INDEX.replace("{id}", String(client.id)),
                payload,
                { onSuccess },
            )
        } else {
            post(API.CLIENT.USERS.INDEX, payload, { onSuccess })
        }
    })

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-6 p-6">
            <CardTitle>
                {client ? `Edit / ${client.company_name}` : "Add Client"}
            </CardTitle>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <UncontrolledInput
                    methods={form}
                    name="company_name"
                    label="Company name"
                />
                <SelectField
                    methods={form}
                    name="customer_type"
                    options={customerTypeOptions}
                    label="Client type"
                    placeholder="Select type"
                />
                <PhoneField
                    methods={form}
                    name="company_phone"
                    label="Phone number"
                />
                <UncontrolledInput
                    methods={form}
                    name="company_email"
                    label="Email"
                    optional
                />
                <UncontrolledInput
                    methods={form}
                    name="region_address"
                    label="Address"
                    optional
                />
                <UncontrolledInput
                    methods={form}
                    name="exact_address"
                    label="Address"
                    optional
                />
                <UncontrolledInput
                    methods={form}
                    name="legal_address"
                    label="Legal address"
                    optional
                />
                <UncontrolledInput
                    methods={form}
                    name="official_name"
                    label="Full address"
                    optional
                />
                <UncontrolledInput
                    methods={form}
                    name="bank_name"
                    label="Bank (AKB)"
                    optional
                />
                <UncontrolledInput
                    methods={form}
                    name="bank_address"
                    label="Address (AKB)"
                    optional
                />
                <UncontrolledInput
                    methods={form}
                    name="mfo_code"
                    label="MFO (AKB)"
                    optional
                />
                <UncontrolledInput
                    methods={form}
                    name="account_number"
                    label="Bank account number"
                    optional
                />
                <UncontrolledInput
                    methods={form}
                    name="okpo_code"
                    label="OKPO"
                    optional
                />
                <UncontrolledInput
                    methods={form}
                    name="activity_field"
                    label="Activity field"
                    optional
                />
                <UncontrolledInput
                    methods={form}
                    name="inn"
                    label="INN"
                    optional
                />
                <UncontrolledInput
                    methods={form}
                    name="full_name"
                    label="CEO/staff full name"
                />
                <PhoneField
                    methods={form}
                    name="phone"
                    label="Phone number"
                    optional
                />
                <UncontrolledInput
                    methods={form}
                    name="email"
                    label="Email"
                    optional
                />
                <NumberField
                    methods={form}
                    name="balance"
                    label="Balance"
                    optional
                    allowNegative
                />
            </div>

            <textarea
                {...form.register("notes")}
                placeholder="Additional information"
                rows={4}
                className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />

            <FormAction
                submitName={client ? "Save" : "Add"}
                loading={isPending}
            />
        </form>
    )
}
