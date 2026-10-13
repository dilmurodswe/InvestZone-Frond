import FileInput from "@/components/custom/file-input"
import FormAction from "@/components/custom/form-action"
import Modal from "@/components/custom/modal"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useSaleClientsQuery } from "@/hooks/react-query/use-sale-refs"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { cn } from "@/lib/utils/shadcn"
import { toFormData } from "@/lib/utils/to-form-data"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { NumericFormat } from "react-number-format"
import { toast } from "sonner"
import { useCurrenciesQuery } from "../-hooks/use-currencies-query"
import { useIncomePrefillStore } from "../-hooks/use-income-prefill-store"
import { useOrdersMiniQuery } from "../-hooks/use-orders-mini-query"
import { usePaymentTypesQuery } from "../-hooks/use-payment-types-query"
import type { Income, IncomeForm } from "../-types"
import CurrencyRateField from "../../-components/currency-rate-field"
import IncomeAllocations, { type AllocationMap } from "./income-allocations"

interface Props {
    income: Income | null
}

/** «Включая НДС» rates; "" = Без НДС. 12% is Uzbekistan's standard rate. */
const VAT_RATES = ["0", "12", "20"]

/** VAT contained in a gross amount: amount × rate / (100 + rate). */
const vatOf = (amount: string, rate: string | null) => {
    const a = Number(amount) || 0
    const r = Number(rate) || 0
    return rate ? String(Math.round(((a * r) / (100 + r)) * 100) / 100) : "0"
}

/** Normalise a stored rate ("12.00") to a VAT_RATES key ("12"). */
const rateKey = (rate: string | null | undefined) =>
    rate == null || rate === "" ? null : String(Number(rate))

export default function IncomeAddEditModal({ income }: Props) {
    const { isOpen } = useModal("add-income")

    return (
        <Modal
            modalKey="add-income"
            title={null}
            className="md:max-w-3xl"
            wrapperClassname="md:max-w-3xl"
        >
            <IncomeFormInner
                key={`${income?.id ?? "new"}-${isOpen}`}
                income={income}
            />
        </Modal>
    )
}

function IncomeFormInner({ income }: Props) {
    const { t } = useTranslation()
    const { closeModal } = useModal("add-income")
    const { invalidateByPatternMatch } = useRevalidate()
    const { postAsync, patchAsync, putAsync, isPending } = useRequest()
    // Separate instance for multipart: clears the JSON Content-Type default so
    // the browser sets `multipart/form-data` with a boundary.
    const fileReq = useRequest({
        config: { headers: { "Content-Type": null } },
    })
    const { currencyList, isLoading: currLoading } = useCurrenciesQuery()
    const { paymentTypeList, isLoading: payLoading } = usePaymentTypesQuery()
    const { orderList, isLoading: ordersLoading } = useOrdersMiniQuery()
    const { clientList } = useSaleClientsQuery()
    const [allocations, setAllocations] = useState<AllocationMap>({})

    const listsLoaded = !currLoading && !payLoading && !ordersLoading
    const form = useForm<IncomeForm>({
        defaultValues: {
            payment_type: null,
            client: income?.client ?? null,
            currency: income?.currency?.id ?? null,
            order: income?.order ?? null,
            category: null,
            subcategory: null,
            attachment: null,
            current_rate: income?.current_rate ?? "",
            custom_rate: income?.custom_rate ?? "",
            date: income?.date ?? format(new Date(), "yyyy-MM-dd"),
            sales_agent: null,
            amount: income?.amount ?? "",
            comment: income?.comment ?? "",
            vat_rate: rateKey(income?.vat_rate),
            vat_amount: income?.vat_amount ?? "0",
            incoming_number: income?.incoming_number ?? "",
            incoming_date: income?.incoming_date ?? null,
            purpose: income?.purpose ?? "",
        },
    })

    const clientId = useWatch({ control: form.control, name: "client" })
    const currencyId = useWatch({ control: form.control, name: "currency" })
    const amount = useWatch({ control: form.control, name: "amount" })
    const vatRate = useWatch({ control: form.control, name: "vat_rate" })
    const currencyCode =
        currencyList
            .find((c) => c.id === Number(currencyId))
            ?.currency?.toUpperCase() ?? null

    useEffect(() => {
        if (!income || !listsLoaded) return
        form.reset({
            payment_type:
                paymentTypeList.find((p) => p.name === income.payment_type)
                    ?.id ?? null,
            client: income.client ?? null,
            currency: income.currency?.id ?? null,
            order: income.order ?? null,
            category: null,
            subcategory: null,
            attachment: null,
            current_rate: income.current_rate ?? "",
            custom_rate: income.custom_rate ?? "",
            date: income.date,
            sales_agent: null,
            amount: income.amount ?? "",
            comment: income.comment ?? "",
            vat_rate: rateKey(income.vat_rate),
            vat_amount: income.vat_amount ?? "0",
            incoming_number: income.incoming_number ?? "",
            incoming_date: income.incoming_date ?? null,
            purpose: income.purpose ?? "",
        })
    }, [listsLoaded]) // eslint-disable-line

    // The VAT part follows the amount and the rate (still editable by hand).
    const setAmount = (value: string) => {
        form.setValue("amount", value)
        form.setValue("vat_amount", vatOf(value, form.getValues("vat_rate")))
    }

    // Picking an order pre-fills amount / currency / rate from it (all editable).
    const onPickOrder = (value: string) => {
        const id = Number(value)
        form.setValue("order", id)
        const order = orderList.find((o) => o.id === id)
        if (!order) return
        if (order.client?.id) form.setValue("client", order.client.id)
        if (order.grand_total) setAmount(String(order.grand_total))
        if (order.currency?.id) form.setValue("currency", order.currency.id)
        if (order.client_currency) {
            form.setValue("current_rate", String(order.client_currency))
            form.setValue("custom_rate", String(order.client_currency))
        }
    }

    // Opened from an order card ("Kirimga o'tkazish") — preselect that order.
    const { orderId: prefillOrderId, setOrderId: setPrefillOrder } =
        useIncomePrefillStore()
    const prefillDone = useRef(false)
    useEffect(() => {
        if (income || prefillDone.current) return
        if (prefillOrderId && orderList.some((o) => o.id === prefillOrderId)) {
            onPickOrder(String(prefillOrderId))
            setPrefillOrder(null)
            prefillDone.current = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prefillOrderId, orderList.length])

    const onSuccess = () => {
        invalidateByPatternMatch([
            API.FINANCE.INCOME.INDEX,
            // An order-linked income is a Приход on that client's Взаиморасчёты.
            API.CLIENT.USERS.INDEX,
            API.SALE.MUTUAL_SETTLEMENTS,
            API.FINANCE.INCOME.CLIENT_DEMANDS,
        ])
        closeModal()
        toast.success(
            income ?
                t("common.updatedSuccessfully")
            :   t("common.addedSuccessfully"),
        )
    }

    const allocList = Object.entries(allocations)
        .filter(([, v]) => Number(v) > 0)
        .map(([demand, v]) => ({ demand: Number(demand), amount: v }))
    const overAllocated =
        allocList.reduce((sum, a) => sum + Number(a.amount), 0) >
        Number(amount || 0)

    const onSubmit = form.handleSubmit(async (vals) => {
        if (overAllocated) {
            toast.error(t("income.overAllocated"))
            return
        }
        const { attachment, ...rest } = vals
        const hasFile = attachment instanceof File
        const payload = hasFile ? toFormData({ ...rest, attachment }) : rest
        const req = hasFile ? fileReq : { postAsync, patchAsync }

        let saved: Income
        try {
            saved =
                income ?
                    await req.patchAsync(
                        API.FINANCE.INCOME.ID.INDEX.replace(
                            "{id}",
                            String(income.id),
                        ),
                        payload,
                    )
                :   await req.postAsync(API.FINANCE.INCOME.INDEX, payload)
        } catch {
            return // useRequest already shows the API error.
        }

        // «Оплаченные документы» — which Отгрузки this payment covers. The
        // Приход itself is saved either way, so close the form even if this
        // fails (its error is toasted) rather than invite a duplicate.
        if (vals.client && (allocList.length || Number(income?.allocated))) {
            await putAsync(
                API.FINANCE.INCOME.ID.ALLOCATIONS.replace(
                    "{id}",
                    String(saved.id),
                ),
                allocList,
            ).catch(() => undefined)
        }
        onSuccess()
    })

    const entity = t("entity.income")

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <CardTitle>
                {income ?
                    t("common.editEntity", { entity })
                :   t("common.addEntity", { entity })}
            </CardTitle>

            <div className="grid grid-cols-1 items-start gap-x-6 gap-y-5 sm:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-1.5">
                    <Label>{t("entity.order")}</Label>
                    <Controller
                        control={form.control}
                        name="order"
                        render={({ field }) => (
                            <Select
                                value={field.value ? String(field.value) : ""}
                                onValueChange={onPickOrder}
                            >
                                <SelectTrigger className="w-full min-w-0">
                                    <SelectValue
                                        placeholder={t("common.select")}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {orderList.map((o) => (
                                        <SelectItem
                                            key={o.id}
                                            value={String(o.id)}
                                        >
                                            №{o.number}
                                            {o.client?.full_name ?
                                                ` — ${o.client.full_name}`
                                            :   ""}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className="flex min-w-0 flex-col gap-1.5">
                    <Label>{t("table.client")}</Label>
                    <Controller
                        control={form.control}
                        name="client"
                        render={({ field }) => (
                            <Select
                                value={field.value ? String(field.value) : ""}
                                onValueChange={(v) => field.onChange(Number(v))}
                            >
                                <SelectTrigger className="w-full min-w-0">
                                    <SelectValue
                                        placeholder={t("common.select")}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {clientList.map((c) => (
                                        <SelectItem
                                            key={c.id}
                                            value={String(c.id)}
                                        >
                                            {c.full_name || c.company_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className="flex min-w-0 flex-col gap-1.5">
                    <Label>{t("table.amount")}</Label>
                    <Controller
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <NumericFormat
                                customInput={Input}
                                value={field.value ?? ""}
                                getInputRef={field.ref}
                                onBlur={field.onBlur}
                                onValueChange={(v, src) => {
                                    if (src.source === "event")
                                        setAmount(v.value)
                                }}
                                thousandSeparator=" "
                                decimalScale={2}
                                allowNegative={false}
                                placeholder="0"
                            />
                        )}
                    />
                </div>

                <div className="flex min-w-0 flex-col gap-1.5">
                    <Label>{t("table.currency")}</Label>
                    <Controller
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                            <Select
                                value={field.value ? String(field.value) : ""}
                                onValueChange={(v) => field.onChange(Number(v))}
                            >
                                <SelectTrigger className="w-full min-w-0">
                                    <SelectValue
                                        placeholder={t("common.select")}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {currencyList.map((c) => (
                                        <SelectItem
                                            key={c.id}
                                            value={String(c.id)}
                                        >
                                            {c.currency} ({c.current_rate})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <CurrencyRateField
                    form={form}
                    currencyName="currency"
                    currentRateName="current_rate"
                    customRateName="custom_rate"
                    currencyList={currencyList}
                    autoFill={!income}
                />

                <div className="flex min-w-0 flex-col gap-1.5">
                    <Label>{t("finCat.kassa")}</Label>
                    <Controller
                        control={form.control}
                        name="payment_type"
                        render={({ field }) => (
                            <Select
                                value={field.value ? String(field.value) : ""}
                                onValueChange={(v) => field.onChange(Number(v))}
                            >
                                <SelectTrigger className="w-full min-w-0">
                                    <SelectValue
                                        placeholder={t("common.select")}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentTypeList.map((p) => (
                                        <SelectItem
                                            key={p.id}
                                            value={String(p.id)}
                                        >
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className="flex min-w-0 flex-col gap-1.5">
                    <Label>{t("income.vat")}</Label>
                    <div className="flex gap-2">
                        <Controller
                            control={form.control}
                            name="vat_rate"
                            render={({ field }) => (
                                <Select
                                    value={field.value ?? "none"}
                                    onValueChange={(v) => {
                                        const rate = v === "none" ? null : v
                                        field.onChange(rate)
                                        form.setValue(
                                            "vat_amount",
                                            vatOf(
                                                form.getValues("amount"),
                                                rate,
                                            ),
                                        )
                                    }}
                                >
                                    <SelectTrigger className="w-32 shrink-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            {t("income.noVat")}
                                        </SelectItem>
                                        {VAT_RATES.map((r) => (
                                            <SelectItem key={r} value={r}>
                                                {r}%
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        <Controller
                            control={form.control}
                            name="vat_amount"
                            render={({ field }) => (
                                <NumericFormat
                                    customInput={Input}
                                    value={field.value ?? ""}
                                    getInputRef={field.ref}
                                    onBlur={field.onBlur}
                                    onValueChange={(v) =>
                                        field.onChange(v.value || "0")
                                    }
                                    thousandSeparator=" "
                                    decimalScale={2}
                                    allowNegative={false}
                                    disabled={!vatRate}
                                    placeholder="0"
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="flex min-w-0 flex-col gap-1.5">
                    <Label>{t("income.incomingNumber")}</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            {...form.register("incoming_number")}
                            className="min-w-0 flex-1"
                            placeholder="№"
                        />
                        <span className="text-sm text-muted-foreground">
                            {t("income.incomingDate")}
                        </span>
                        <Controller
                            control={form.control}
                            name="incoming_date"
                            render={({ field }) => (
                                <DateField
                                    value={field.value}
                                    onChange={field.onChange}
                                    className="w-40 shrink-0"
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
                    <Label>{t("table.date")}</Label>
                    <Controller
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <DateField
                                value={field.value}
                                onChange={(v) => field.onChange(v ?? "")}
                            />
                        )}
                    />
                </div>

                <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
                    <Label>{t("income.purpose")}</Label>
                    <Textarea
                        {...form.register("purpose")}
                        className="h-16"
                        placeholder={t("common.enterValue")}
                    />
                </div>

                <IncomeAllocations
                    clientId={clientId ? Number(clientId) : null}
                    currency={currencyCode}
                    incomeId={income?.id ?? null}
                    amount={Number(amount || 0)}
                    value={allocations}
                    onChange={setAllocations}
                />

                <div className="flex min-w-0 flex-col gap-1.5">
                    <Label>{t("table.comment")}</Label>
                    <Controller
                        control={form.control}
                        name="comment"
                        render={({ field }) => (
                            <Textarea
                                {...field}
                                value={field.value ?? ""}
                                className="h-16"
                                placeholder={t("common.enterValue")}
                            />
                        )}
                    />
                </div>

                <div className="flex min-w-0 flex-col gap-1.5">
                    <Label>{t("finCat.attachFile")}</Label>
                    <Controller
                        control={form.control}
                        name="attachment"
                        render={({ field }) => (
                            <FileInput
                                value={field.value}
                                onChange={field.onChange}
                                placeholder={t("finCat.attachFile")}
                            />
                        )}
                    />
                    {income?.attachment && (
                        <a
                            href={income.attachment}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary underline"
                        >
                            {t("finCat.currentFile")}
                        </a>
                    )}
                </div>
            </div>

            <FormAction
                submitName={income ? t("common.save") : t("common.add")}
                loading={isPending || fileReq.isPending}
            />
        </form>
    )
}

function DateField({
    value,
    onChange,
    className,
}: {
    value: string | null
    onChange: (value: string | null) => void
    className?: string
}) {
    const { t } = useTranslation()
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-muted-foreground",
                        className,
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value || t("common.pickDate")}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={value ? new Date(value) : undefined}
                    onSelect={(d) =>
                        onChange(d ? format(d, "yyyy-MM-dd") : null)
                    }
                    autoFocus
                />
            </PopoverContent>
        </Popover>
    )
}
