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
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { useSupplierStore } from "../-hooks/use-supplier-store"
import type { CustomerType, Supplier } from "../-types"

export default function SupplierAddEditModal() {
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
    { id: "llc", name: "LLC" },
    { id: "jv_llc", name: "JV LLC" },
    { id: "family", name: "Family" },
    { id: "jsc", name: "JSC" },
    { id: "fie", name: "FIE" },
    { id: "ue", name: "UE" },
    { id: "be", name: "BE" },
    { id: "sp", name: "SP" },
]

function Content() {
    const { closeModal } = useModal()
    const { invalidateByExactMatch } = useRevalidate()
    const { supplier } = useSupplierStore()
    const { post, patch, isPending } = useRequest()
    const { t } = useTranslation()

    const form = useForm<Supplier>({
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
        values: supplier ? { ...supplier } : undefined,
    })

    const onSuccess = () => {
        invalidateByExactMatch([API.SUPPLIER.USERS.INDEX])
        closeModal()
        toast.success(
            supplier ? "Updated successfully" : "Supplier added successfully",
        )
    }

    const onSubmit = form.handleSubmit((vals) => {
        const payload = { ...vals }
        if (supplier) {
            patch(
                API.SUPPLIER.USERS.ID.INDEX.replace(
                    "{id}",
                    String(supplier.id),
                ),
                payload,
                { onSuccess },
            )
        } else {
            post(API.SUPPLIER.USERS.INDEX, payload, { onSuccess })
        }
    })

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-6 p-6">
            <CardTitle>
                {supplier ?
                    t("common.editEntity", { entity: t("entity.supplier") })
                :   t("common.addEntity", { entity: t("entity.supplier") })}
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
                    label="Supplier type"
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
                <UncontrolledInput methods={form} name="inn" label="INN" />
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
                submitName={supplier ? t("common.save") : t("common.add")}
                loading={isPending}
            />
        </form>
    )
}
