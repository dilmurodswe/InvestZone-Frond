import Modal from "@/components/custom/modal"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { cn } from "@/lib/utils/shadcn"
import { useTranslation } from "react-i18next"
import { useClientStore } from "../-hooks/use-client-store"
import {
    CURRENCY_CODES,
    type ClientLedgerKind,
    type ClientLedgerResponse,
} from "../-types"
import { balanceToneClass, fmtMoney } from "./client-balance-utils"

export default function ClientDetailModal() {
    return (
        <Modal
            modalKey="client-detail"
            title={null}
            wrapperClassname="md:w-[900px]! md:max-w-none"
            className="min-w-[860px]!"
        >
            <ClientDetail />
        </Modal>
    )
}

function ClientDetail() {
    const { client } = useClientStore()
    const { t } = useTranslation()

    const { data: ledger, isFetching } = useGet<ClientLedgerResponse>(
        client ?
            API.CLIENT.USERS.LEDGER.INDEX.replace("{id}", String(client.id))
        :   "",
        { options: { enabled: !!client, staleTime: 0 } },
    )

    if (!client) return null

    const kindLabel = (k: ClientLedgerKind) =>
        k === "shipment" ? t("mutual.kindShipment")
        : k === "payment" ? t("mutual.kindPayment")
        : t("mutual.kindAdjustment")

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
                    <Badge
                        variant="secondary"
                        className="capitalize font-semibold text-xs flex-shrink-0"
                    >
                        {client.customer_type}
                    </Badge>
                )}
            </div>

            {/* Взаиморасчёты */}
            <Section title={t("client.balances")}>
                <div className="grid grid-cols-3 divide-x">
                    {CURRENCY_CODES.map((code) => {
                        const v = client.balances?.[code] ?? "0"
                        const n = Number(v)
                        return (
                            <div
                                key={code}
                                className="flex flex-col gap-0.5 px-4 py-3"
                            >
                                <span className="text-xs text-muted-foreground">
                                    {code}
                                    {n ?
                                        ` · ${n < 0 ? t("client.debt") : t("client.advance")}`
                                    :   ""}
                                </span>
                                <span
                                    className={cn(
                                        "text-sm font-semibold tabular-nums",
                                        n ? balanceToneClass(v) : "",
                                    )}
                                >
                                    {fmtMoney(v)}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </Section>

            {/* Settlement history */}
            <Section title={t("client.ledger")}>
                <div className="max-h-72 overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("table.date")}</TableHead>
                                <TableHead>{t("table.type")}</TableHead>
                                <TableHead>{t("table.comment")}</TableHead>
                                <TableHead className="text-right">
                                    {t("mutual.income")}
                                </TableHead>
                                <TableHead className="text-right">
                                    {t("mutual.expense")}
                                </TableHead>
                                <TableHead className="text-right">
                                    {t("cashFlow.balance")}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isFetching && !ledger ?
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-16 text-center text-sm text-muted-foreground"
                                    >
                                        {t("common.loading")}
                                    </TableCell>
                                </TableRow>
                            : !ledger?.rows.length ?
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-16 text-center text-sm text-muted-foreground"
                                    >
                                        {t("client.noMovements")}
                                    </TableCell>
                                </TableRow>
                            :   ledger.rows.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell className="whitespace-nowrap">
                                            {r.date}
                                        </TableCell>
                                        <TableCell>
                                            {kindLabel(r.kind)}
                                        </TableCell>
                                        <TableCell className="max-w-[280px] truncate">
                                            {r.comment || "—"}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums text-green-600">
                                            {Number(r.income) ?
                                                `${fmtMoney(r.income)} ${r.currency}`
                                            :   "—"}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums text-red-600">
                                            {Number(r.expense) ?
                                                `${fmtMoney(r.expense)} ${r.currency}`
                                            :   "—"}
                                        </TableCell>
                                        <TableCell
                                            className={cn(
                                                "text-right font-medium tabular-nums",
                                                balanceToneClass(
                                                    r.balance_after,
                                                ),
                                            )}
                                        >
                                            {fmtMoney(r.balance_after)}{" "}
                                            {r.currency}
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </div>
            </Section>

            {/* General */}
            <Section title="General">
                <div className="grid grid-cols-3 divide-x divide-y">
                    <Cell
                        label="Activity field"
                        value={client.activity_field}
                    />
                    <Cell label="INN" value={client.inn} />
                    <Cell label="OKPO code" value={client.okpo_code} />
                    <Cell
                        label="Date joined"
                        value={
                            client.created_at ?
                                new Date(client.created_at).toLocaleDateString()
                            :   null
                        }
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
                    <Cell
                        label="Account number"
                        value={client.account_number}
                    />
                </div>
            </Section>

            {/* Notes */}
            {client.notes && (
                <Section title="Notes">
                    <p className="px-4 py-3 text-sm text-muted-foreground">
                        {client.notes}
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
