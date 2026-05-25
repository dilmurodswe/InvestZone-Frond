import Modal from "@/components/custom/modal"
import { Badge } from "@/components/ui/badge"
import { formatDecimal } from "@/lib/utils/format-number"
import { useSupplierStore } from "../-hooks/use-supplier-store"

export default function SupplierDetailModal() {
    return (
        <Modal
            modalKey="supplier-detail"
            title={null}
            wrapperClassname="md:w-[900px]! md:max-w-none"
            className="min-w-[860px]!"
        >
            <SupplierDetail />
        </Modal>
    )
}

function SupplierDetail() {
    const { supplier } = useSupplierStore()
    if (!supplier) return null

    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold">
                        {supplier.company_name}
                    </h2>
                    {supplier.official_name && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {supplier.official_name}
                        </p>
                    )}
                </div>
                {supplier.customer_type && (
                    <Badge
                        variant="secondary"
                        className="capitalize font-semibold text-xs flex-shrink-0"
                    >
                        {supplier.customer_type}
                    </Badge>
                )}
            </div>

            {/* General */}
            <Section title="General">
                <div className="grid grid-cols-3 divide-x divide-y">
                    <Cell
                        label="Activity field"
                        value={supplier.activity_field}
                    />
                    <Cell label="INN" value={supplier.inn} />
                    <Cell label="OKPO code" value={supplier.okpo_code} />
                    <Cell
                        label="Balance"
                        value={
                            supplier.balance != null ?
                                formatDecimal(supplier.balance)
                            :   null
                        }
                    />
                    <Cell
                        label="Date joined"
                        value={
                            supplier.date_joined ?
                                new Date(
                                    supplier.date_joined,
                                ).toLocaleDateString()
                            :   null
                        }
                    />
                </div>
            </Section>

            {/* Contact */}
            <Section title="Contact">
                <div className="grid grid-cols-3 divide-x divide-y">
                    <Cell label="Full name" value={supplier.full_name} />
                    <Cell label="Position" value={supplier.position} />
                    <Cell label="Phone" value={supplier.phone} />
                    <Cell label="Email" value={supplier.email} />
                    <Cell
                        label="Company phone"
                        value={supplier.company_phone}
                    />
                    <Cell
                        label="Company email"
                        value={supplier.company_email}
                    />
                </div>
            </Section>

            {/* Address */}
            <Section title="Address">
                <div className="grid grid-cols-3 divide-x divide-y">
                    {/* <Cell label="Region" value={supplier.region_address} />
                    <Cell
                        label="Exact address"
                        value={supplier.exact_address}
                    /> */}
                    <Cell
                        label="Legal address"
                        value={supplier.legal_address}
                    />
                    <Cell label="Full address" value={supplier.official_name} />
                </div>
            </Section>

            {/* Bank */}
            <Section title="Bank">
                <div className="grid grid-cols-3 divide-x divide-y">
                    <Cell label="Bank name" value={supplier.bank_name} />
                    <Cell label="Bank address" value={supplier.bank_address} />
                    <Cell label="MFO code" value={supplier.mfo_code} />
                    <Cell
                        label="Account number"
                        value={supplier.account_number}
                    />
                </div>
            </Section>

            {/* Notes */}
            {supplier.notes && (
                <Section title="Notes">
                    <p className="px-4 py-3 text-sm text-muted-foreground">
                        {supplier.notes}
                    </p>
                </Section>
            )}
        </div>
    )
}

function Section({
    title,
    children,
}: {
    title: string
    children: React.ReactNode
}) {
    return (
        <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/40 px-4 py-2 border-b">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {title}
                </p>
            </div>
            {children}
        </div>
    )
}

function Cell({
    label,
    value,
}: {
    label: string
    value: string | number | null | undefined
}) {
    return (
        <div className="flex flex-col gap-0.5 px-4 py-3">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-sm font-medium break-words">
                {value != null && value !== "" ?
                    String(value)
                :   <span className="text-muted-foreground font-normal">—</span>
                }
            </span>
        </div>
    )
}
