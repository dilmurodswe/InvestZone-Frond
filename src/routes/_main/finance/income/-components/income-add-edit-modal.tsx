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
import { useEffect } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { NumericFormat } from "react-number-format"
import { toast } from "sonner"
import { useCurrenciesQuery } from "../-hooks/use-currencies-query"
import { usePaymentTypesQuery } from "../-hooks/use-payment-types-query"
import { useSalesAgentsQuery } from "../-hooks/use-sales-agents-query"
import type { Income, IncomeForm } from "../-types"
import CurrencyRateField from "../../-components/currency-rate-field"
import {
    useFinanceCategoriesQuery,
    useFinanceSubcategoriesQuery,
} from "../../-hooks/use-finance-categories"

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
    const { salesAgentList, isLoading: agentLoading } = useSalesAgentsQuery()
    const { categoryList } = useFinanceCategoriesQuery("income")

    const listsLoaded = !currLoading && !payLoading && !agentLoading
    const form = useForm<IncomeForm>({
        defaultValues: {
            payment_type: null, // list kerak, pastda reset qilinadi
            currency: income?.currency?.id ?? null,
            category: income?.category?.id ?? null,
            subcategory: income?.subcategory?.id ?? null,
            attachment: null,
            current_rate: income?.current_rate ?? "",
            custom_rate: income?.custom_rate ?? "",
            date: income?.date ?? format(new Date(), "yyyy-MM-dd"),
            sales_agent: null, // list kerak, pastda reset qilinadi
            amount: income?.amount ?? "",
            comment: income?.comment ?? "",
        },
    })

    const categoryId = useWatch({ control: form.control, name: "category" })
    const { subcategoryList } = useFinanceSubcategoriesQuery(categoryId)

    useEffect(() => {
        if (!income || !listsLoaded) return
        form.reset({
            payment_type:
                paymentTypeList.find((p) => p.name === income.payment_type)
                    ?.id ?? null,
            currency: income.currency?.id ?? null,
            category: income.category?.id ?? null,
            subcategory: income.subcategory?.id ?? null,
            attachment: null,
            current_rate: income.current_rate ?? "",
            custom_rate: income.custom_rate ?? "",
            date: income.date,
            sales_agent:
                salesAgentList.find(
                    (a) =>
                        `${a.first_name} ${a.last_name}` === income.sales_agent,
                )?.id ?? null,
            amount: income.amount ?? "",
            comment: income.comment ?? "",
        })
    }, [listsLoaded]) // eslint-disable-line

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

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <CardTitle>
                {income ?
                    t("common.editEntity", { entity })
                :   t("common.addEntity", { entity })}
            </CardTitle>

            <div className="grid grid-cols-1 items-start gap-x-6 gap-y-5 sm:grid-cols-2">
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

                <div className="flex min-w-0 flex-col gap-1.5">
                    <Label>{t("entity.category")}</Label>
                    <Controller
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <Select
                                value={field.value ? String(field.value) : ""}
                                onValueChange={(v) => {
                                    field.onChange(Number(v))
                                    form.setValue("subcategory", null)
                                }}
                            >
                                <SelectTrigger className="w-full min-w-0">
                                    <SelectValue
                                        placeholder={t("common.select")}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {categoryList.map((c) => (
                                        <SelectItem
                                            key={c.id}
                                            value={String(c.id)}
                                        >
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className="flex min-w-0 flex-col gap-1.5">
                    <Label>{t("entity.subcategory")}</Label>
                    <Controller
                        control={form.control}
                        name="subcategory"
                        render={({ field }) => (
                            <Select
                                disabled={!categoryId}
                                value={field.value ? String(field.value) : ""}
                                onValueChange={(v) => field.onChange(Number(v))}
                            >
                                <SelectTrigger className="w-full min-w-0">
                                    <SelectValue
                                        placeholder={t("common.select")}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {subcategoryList.map((c) => (
                                        <SelectItem
                                            key={c.id}
                                            value={String(c.id)}
                                        >
                                            {c.name}
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
                    <Label>{t("table.salesAgent")}</Label>
                    <Controller
                        control={form.control}
                        name="sales_agent"
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
                                    {salesAgentList.map((a) => (
                                        <SelectItem
                                            key={a.id}
                                            value={String(a.id)}
                                        >
                                            {a.first_name} {a.last_name}
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
