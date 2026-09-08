import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import DatepickerField from "@/components/form/datepicker-field"
import NumberField from "@/components/form/number-field"
import SwitchField from "@/components/form/switch-field"
import UncontrolledInput from "@/components/form/uncontrolled-input"
import UncontrolledTextarea from "@/components/form/uncontrolled-textarea"
import { CardTitle } from "@/components/ui/card"
import { useGet } from "@/hooks/react-query/use-get"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { toCurrencyCode } from "@/routes/_main/clients/-components/client-balance-utils"
import { ClientBalanceChip } from "@/routes/_main/clients/-components/client-balances"
import type { Client } from "@/routes/_main/clients/-types"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { useDemandStore } from "../-hooks/use-demand-store"
import type { DemandHeaderForm } from "../-types"

/**
 * Shipment lines are fixed once the document exists — they are what left the
 * warehouse. Only the header (dates, transport, waybill, comment) is editable.
 */
export default function DemandEditModal() {
    return (
        <Modal
            modalKey="edit-demand"
            title={null}
            wrapperClassname="md:w-[820px]! md:max-w-none"
            className="min-w-[780px]!"
        >
            <DemandEdit />
        </Modal>
    )
}

function DemandEdit() {
    const { t } = useTranslation()
    const { demand } = useDemandStore()
    const { closeModal } = useModal("edit-demand")
    const { invalidateByExactMatch, invalidateByPatternMatch } = useRevalidate()
    const { patch, isPending } = useRequest()

    const form = useForm<DemandHeaderForm>({
        values:
            demand ?
                {
                    doc_date: demand.doc_date?.slice(0, 10) ?? null,
                    description: demand.description ?? "",
                    shipment_address: demand.shipment_address ?? "",
                    carrier: demand.carrier ?? "",
                    cargo_name: demand.cargo_name ?? "",
                    places_count: demand.places_count,
                    transport_number: demand.transport_number ?? "",
                    waybill_number: demand.waybill_number ?? "",
                    waybill_date: demand.waybill_date,
                    applicable: demand.applicable,
                }
            :   undefined,
    })

    const { data: fullClient } = useGet<Client>(
        demand ?
            API.CLIENT.USERS.ID.INDEX.replace("{id}", String(demand.client.id))
        :   "",
        { options: { enabled: !!demand, staleTime: 0 } },
    )

    const onSubmit = form.handleSubmit((vals) => {
        if (!demand) return
        patch(API.DEMANDS.ID.INDEX.replace("{id}", String(demand.id)), vals, {
            onSuccess: () => {
                invalidateByExactMatch([API.DEMANDS.INDEX])
                invalidateByExactMatch([
                    API.DEMANDS.ID.INDEX.replace("{id}", String(demand.id)),
                ])
                // Posting / un-posting moves the client's balance.
                invalidateByPatternMatch([
                    API.CLIENT.USERS.INDEX,
                    API.SALE.MUTUAL_SETTLEMENTS,
                ])
                closeModal()
                toast.success(t("common.updatedSuccessfully"))
            },
        })
    })

    if (!demand) return null

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle>
                    {t("common.editEntity", { entity: t("entity.demand") })} №
                    {demand.number}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">
                        {demand.client.company_name || demand.client.full_name}
                    </span>
                    {fullClient?.balances && (
                        <ClientBalanceChip
                            balances={fullClient.balances}
                            currency={toCurrencyCode(demand.currency?.currency)}
                            labels={{
                                advance: t("client.advance"),
                                debt: t("client.debt"),
                                zero: t("cashFlow.balance"),
                            }}
                        />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <DatepickerField
                    methods={form}
                    name="doc_date"
                    label={t("table.date")}
                    optional
                />
                <UncontrolledInput
                    methods={form}
                    name="carrier"
                    label={t("table.carrier")}
                    optional
                />
                <UncontrolledInput
                    methods={form}
                    name="transport_number"
                    label={t("table.transportNumber")}
                    optional
                />
            </div>

            <div className="grid grid-cols-4 gap-4">
                <UncontrolledInput
                    methods={form}
                    name="cargo_name"
                    label={t("table.cargoName")}
                    optional
                />
                <NumberField
                    methods={form}
                    name="places_count"
                    label={t("table.placesCount")}
                    optional
                />
                <UncontrolledInput
                    methods={form}
                    name="waybill_number"
                    label={t("table.waybillNumber")}
                    optional
                />
                <DatepickerField
                    methods={form}
                    name="waybill_date"
                    label={t("table.waybillDate")}
                    optional
                />
            </div>

            <UncontrolledInput
                methods={form}
                name="shipment_address"
                label={t("table.deliveryAddress")}
                optional
            />

            <UncontrolledTextarea
                methods={form}
                name="description"
                label={t("table.comment")}
                rows={2}
                optional
            />

            <SwitchField
                methods={form}
                name="applicable"
                label={t("table.posted")}
                wrapperClassName="w-auto"
            />

            <FormAction submitName={t("common.save")} loading={isPending} />
        </form>
    )
}
