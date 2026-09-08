import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import DatepickerField from "@/components/form/datepicker-field"
import NumberField from "@/components/form/number-field"
import UncontrolledInput from "@/components/form/uncontrolled-input"
import UncontrolledTextarea from "@/components/form/uncontrolled-textarea"
import { CardTitle } from "@/components/ui/card"
import { useGet } from "@/hooks/react-query/use-get"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { round3 } from "@/lib/utils/format-number"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { useOrderStore } from "../-hooks/use-order-store"
import type { Order } from "../-types"

type DemandLine = {
    order_item: number
    product_name: string
    remaining: number
    quantity: number | null
}

type CreateDemandForm = {
    doc_date: string | null
    description: string
    carrier: string
    cargo_name: string
    places_count: number | null
    transport_number: string
    waybill_number: string
    waybill_date: string | null
    lines: DemandLine[]
}

const EMPTY_FORM: CreateDemandForm = {
    doc_date: null,
    description: "",
    carrier: "",
    cargo_name: "",
    places_count: null,
    transport_number: "",
    waybill_number: "",
    waybill_date: null,
    lines: [],
}

export default function CreateDemandModal() {
    return (
        <Modal
            modalKey="create-demand"
            title={null}
            wrapperClassname="md:w-[900px]! md:max-w-none"
            className="min-w-[860px]!"
        >
            <CreateDemand />
        </Modal>
    )
}

function CreateDemand() {
    const { t } = useTranslation()
    const { order } = useOrderStore()
    const { closeModal } = useModal("create-demand")
    const { invalidateByExactMatch, invalidateByPatternMatch } = useRevalidate()
    const { post, isPending } = useRequest()

    const orderUrl = API.ORDERS.ID.INDEX.replace(
        "{id}",
        String(order?.id ?? ""),
    )
    const { data, isLoading } = useGet<Order>(orderUrl, {
        options: { enabled: !!order?.id },
    })

    const lines: DemandLine[] = (data?.items ?? [])
        .map((item) => {
            const remaining = Number(item.quantity) - Number(item.shipped)
            return {
                order_item: item.id,
                product_name: item.product?.name ?? "—",
                remaining,
                quantity: remaining > 0 ? remaining : null,
            }
        })
        .filter((line) => line.remaining > 0)

    const form = useForm<CreateDemandForm>({
        defaultValues: EMPTY_FORM,
        // Lines only exist once the order is loaded, so seed them then.
        values: data ? { ...EMPTY_FORM, lines } : undefined,
    })

    const onSubmit = form.handleSubmit((vals) => {
        const items = vals.lines
            .filter((line) => Number(line.quantity) > 0)
            .map((line) => ({
                order_item: line.order_item,
                quantity: Number(line.quantity),
            }))

        if (!items.length) {
            toast.error(t("common.nothingToShip"))
            return
        }

        post(
            API.ORDERS.ID.CREATE_DEMAND.replace("{id}", String(order?.id)),
            {
                doc_date: vals.doc_date || undefined,
                description: vals.description,
                carrier: vals.carrier,
                cargo_name: vals.cargo_name,
                places_count: vals.places_count || undefined,
                transport_number: vals.transport_number,
                waybill_number: vals.waybill_number,
                waybill_date: vals.waybill_date || undefined,
                items,
            },
            {
                onSuccess: () => {
                    invalidateByExactMatch([API.ORDERS.INDEX])
                    invalidateByExactMatch([API.DEMANDS.INDEX])
                    invalidateByExactMatch([orderUrl])
                    // The shipment is posted on creation → client's
                    // Взаиморасчёты balance just changed.
                    invalidateByPatternMatch([
                        API.CLIENT.USERS.INDEX,
                        API.SALE.MUTUAL_SETTLEMENTS,
                    ])
                    closeModal()
                    toast.success(t("common.addedSuccessfully"))
                },
            },
        )
    })

    if (!order) return null
    if (isLoading)
        return (
            <div className="py-8 text-center text-sm text-muted-foreground">
                {t("common.loading")}
            </div>
        )

    return (
        <form
            onSubmit={onSubmit}
            className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-1"
        >
            <CardTitle>
                {t("common.createDemand")} — {t("entity.order")} №{order.number}
            </CardTitle>

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

            <UncontrolledTextarea
                methods={form}
                name="description"
                label={t("table.comment")}
                rows={2}
                optional
            />

            <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/40 px-4 py-2 border-b">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("table.products")}
                    </p>
                </div>
                {lines.length ?
                    <>
                        <div className="grid grid-cols-[1fr_90px_140px] items-center gap-4 border-b bg-muted/20 px-4 py-2 text-xs font-medium text-muted-foreground">
                            <span>{t("table.productName")}</span>
                            <span className="text-right">
                                {t("table.remaining")}
                            </span>
                            <span className="text-right">
                                {t("table.shippedQty")}
                            </span>
                        </div>
                        <div className="flex flex-col divide-y">
                            {lines.map((line, index) => (
                                <div
                                    key={line.order_item}
                                    className="grid grid-cols-[1fr_90px_140px] items-center gap-4 px-4 py-2.5"
                                >
                                    <span className="text-sm font-medium">
                                        {line.product_name}
                                    </span>
                                    <span className="text-right text-sm tabular-nums text-muted-foreground">
                                        {round3(line.remaining)}
                                    </span>
                                    <NumberField
                                        methods={form}
                                        name={`lines.${index}.quantity`}
                                        optional
                                        allowZero
                                        showError
                                        registerOptions={{
                                            validate: (value) =>
                                                Number(value) <=
                                                    line.remaining ||
                                                `${t("table.remaining")}: ${round3(line.remaining)}`,
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                :   <p className="px-4 py-3 text-sm text-muted-foreground">
                        {t("common.nothingToShip")}
                    </p>
                }
            </div>

            <FormAction
                submitName={t("common.create")}
                loading={isPending}
                disabled={!lines.length}
            />
        </form>
    )
}
