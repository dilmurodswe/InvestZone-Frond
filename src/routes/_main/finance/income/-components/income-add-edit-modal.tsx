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
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { cn } from "@/lib/utils/shadcn"
import { toFormData } from "@/lib/utils/to-form-data"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useEffect, useRef } from "react"
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

interface Props {
    income: Income | null
}

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
    const { post, patch, isPending } = useRequest()
    // Separate instance for multipart: clears the JSON Content-Type default so
    // the browser sets `multipart/form-data` with a boundary.
    const fileReq = useRequest({
        config: { headers: { "Content-Type": null } },
    })
    const { currencyList, isLoading: currLoading } = useCurrenciesQuery()
    const { paymentTypeList, isLoading: payLoading } = usePaymentTypesQuery()
    const { orderList, isLoading: ordersLoading } = useOrdersMiniQuery()

    const listsLoaded = !currLoading && !payLoading && !ordersLoading
    const form = useForm<IncomeForm>({
        defaultValues: {
            payment_type: null,
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
        },
    })

    const orderId = useWatch({ control: form.control, name: "order" })
    const selectedOrder = orderList.find((o) => o.id === Number(orderId))

    useEffect(() => {
        if (!income || !listsLoaded) return
        form.reset({
            payment_type:
                paymentTypeList.find((p) => p.name === income.payment_type)
                    ?.id ?? null,
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
        })
    }, [listsLoaded]) // eslint-disable-line

    // Picking an order pre-fills amount / currency / rate from it (all editable).
    const onPickOrder = (value: string) => {
        const id = Number(value)
        form.setValue("order", id)
        const order = orderList.find((o) => o.id === id)
        if (!order) return
        if (order.grand_total)
            form.setValue("amount", String(order.grand_total))
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
        invalidateByPatternMatch([API.FINANCE.INCOME.INDEX])
        closeModal()
        toast.success(
            income ?
                t("common.updatedSuccessfully")
            :   t("common.addedSuccessfully"),
        )
    }

    const onSubmit = form.handleSubmit((vals) => {
        const { attachment, ...rest } = vals
        const hasFile = attachment instanceof File
        const payload = hasFile ? toFormData({ ...rest, attachment }) : rest
        const { post: doPost, patch: doPatch } =
            hasFile ? fileReq : { post, patch }

        if (income) {
            doPatch(
                API.FINANCE.INCOME.ID.INDEX.replace("{id}", String(income.id)),
                payload,
                { onSuccess },
            )
        } else {
            doPost(API.FINANCE.INCOME.INDEX, payload, { onSuccess })
        }
    })

    const entity = t("entity.income")
    const clientName =
        selectedOrder?.client?.full_name ||
        selectedOrder?.client?.company_name ||
        "—"

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
                    <div className="flex h-9 items-center text-sm text-muted-foreground">
                        {clientName}
                    </div>
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
                                onValueChange={(v) => field.onChange(v.value)}
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

                <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
                    <Label>{t("table.date")}</Label>
                    <Controller
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !field.value &&
                                                "text-muted-foreground",
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value ?
                                            field.value
                                        :   t("common.pickDate")}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={
                                            field.value ?
                                                new Date(field.value)
                                            :   undefined
                                        }
                                        onSelect={(d) =>
                                            field.onChange(
                                                d ?
                                                    format(d, "yyyy-MM-dd")
                                                :   "",
                                            )
                                        }
                                        autoFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                </div>

                <div className="flex min-w-0 flex-col gap-1.5">
                    <Label>{t("table.comment")}</Label>
                    <Controller
                        control={form.control}
                        name="comment"
                        render={({ field }) => (
                            <Input
                                {...field}
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
