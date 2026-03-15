import Modal from "@/components/custom/modal"
import { useClientStore } from "../-hooks/use-client-store"
import { Badge } from "@/components/ui/badge"

export default function ClientDetailModal() {
    return (
        <Modal
            modalKey="client-detail"
            title={null}
            wrapperClassname="!max-w-[70vw] w-[70vw]"
        >
            <ClientDetail />
        </Modal>
    )
}

function ClientDetail() {
    const { client } = useClientStore()
    if (!client) return null

    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold">{client.company_name}</h2>
                    {client.official_name && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {client.official_name}
                        </p>
                    )}
                </div>
                {client.customer_type && (
                    <Badge variant="secondary" className="capitalize font-semibold text-xs flex-shrink-0">
                        {client.customer_type}
                    </Badge>
                )}
            </div>

            {/* General */}
            <Section title="General">
                <div className="grid grid-cols-3 divide-x divide-y">
                    <Cell label="Activity field" value={client.activity_field} />
                    <Cell label="INN" value={client.inn} />
                    <Cell label="OKPO code" value={client.okpo_code} />
                    <Cell label="Balance" value={client.balance != null ? client.balance.toLocaleString() : null} />
                    <Cell
                        label="Date joined"
                        value={client.created_at ? new Date(client.created_at).toLocaleDateString() : null}
                    />
                </div>
            </Section>

            {/* Contact */}
            <Section title="Contact">
                <div className="grid grid-cols-3 divide-x divide-y">
                    <Cell label="Full name" value={client.full_name} />
                    <Cell label="Position" value={client.position} />
                    <Cell label="Phone" value={client.phone} />
                    <Cell label="Email" value={client.email} />
                    <Cell label="Company phone" value={client.company_phone} />
                    <Cell label="Company email" value={client.company_email} />
                </div>
            </Section>

            {/* Address */}
            <Section title="Address">
                <div className="grid grid-cols-3 divide-x divide-y">
                    <Cell label="Region" value={client.region_address} />
                    <Cell label="Exact address" value={client.exact_address} />
                    <Cell label="Legal address" value={client.legal_address} />
                </div>
            </Section>

            {/* Bank */}
            <Section title="Bank">
                <div className="grid grid-cols-3 divide-x divide-y">
                    <Cell label="Bank name" value={client.bank_name} />
                    <Cell label="Bank address" value={client.bank_address} />
                    <Cell label="MFO code" value={client.mfo_code} />
                    <Cell label="Account number" value={client.account_number} />
                </div>
            </Section>

            {/* Notes */}
            {client.notes && (
                <Section title="Notes">
                    <p className="px-4 py-3 text-sm text-muted-foreground">{client.notes}</p>
                </Section>
            )}
        </div>
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
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

function Cell({ label, value }: { label: string; value: string | number | null | undefined }) {
    return (
        <div className="flex flex-col gap-0.5 px-4 py-3">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-sm font-medium break-words">
                {value != null && value !== "" ? (
                    String(value)
                ) : (
                    <span className="text-muted-foreground font-normal">—</span>
                )}
            </span>
        </div>
    )
}