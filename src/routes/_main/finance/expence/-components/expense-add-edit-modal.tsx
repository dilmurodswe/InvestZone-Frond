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
import type { Expense, ExpenseForm } from "../-types"
import CurrencyRateField from "../../-components/currency-rate-field"
import {
    useFinanceCategoriesQuery,
    useFinanceSubcategoriesQuery,
} from "../../-hooks/use-finance-categories"

interface Props {
    expense: Expense | null
}

export default function ExpenseAddEditModal({ expense }: Props) {
    const { isOpen } = useModal("add-expense")

    return (
        <Modal
            modalKey="add-expense"
            title={null}
            className="md:max-w-3xl"
            wrapperClassname="md:max-w-3xl"
        >
            <ExpenseFormInner
                key={`${expense?.id ?? "new"}-${isOpen}`}
                expense={expense}
            />
        </Modal>
    )
}

function ExpenseFormInner({ expense }: Props) {
    const { t } = useTranslation()
    const { closeModal } = useModal("add-expense")
    const { invalidateByPatternMatch } = useRevalidate()
    const { post, patch, isPending } = useRequest()
    // Separate instance for multipart: clears the JSON Content-Type default so
    // the browser sets `multipart/form-data` with a boundary.
    const fileReq = useRequest({
        config: { headers: { "Content-Type": null } },
    })
    const { currencyList, isLoading: currLoading } = useCurrenciesQuery()
    const { paymentTypeList, isLoading: payLoading } = usePaymentTypesQuery()
    const { categoryList } = useFinanceCategoriesQuery("expense")

    const listsLoaded = !currLoading && !payLoading

    const form = useForm<ExpenseForm>({
        defaultValues: {
            payment_type:
                expense ?
                    (paymentTypeList.find(
                        (p) => p.name === expense.payment_type,
                    )?.id ?? null)
                :   null,
            currency: expense?.currency?.id ?? null,
            category: expense?.category?.id ?? null,
            subcategory: expense?.subcategory?.id ?? null,
            attachment: null,
            current_rate: expense?.current_rate ?? "",
            custom_rate: expense?.custom_rate ?? "",
            date: expense?.date ?? format(new Date(), "yyyy-MM-dd"),
            amount: expense?.amount ?? "",
            comment: expense?.comment ?? "",
        },
    })

    const categoryId = useWatch({ control: form.control, name: "category" })
    const { subcategoryList } = useFinanceSubcategoriesQuery(categoryId)

    useEffect(() => {
        if (!expense || !listsLoaded) return
        form.reset({
            payment_type:
                paymentTypeList.find((p) => p.name === expense.payment_type)
                    ?.id ?? null,
            currency: expense.currency?.id ?? null,
            category: expense.category?.id ?? null,
            subcategory: expense.subcategory?.id ?? null,
            attachment: null,
            current_rate: expense.current_rate ?? "",
            custom_rate: expense.custom_rate ?? "",
            date: expense.date,
            amount: expense.amount ?? "",
            comment: expense.comment ?? "",
        })
    }, [listsLoaded]) // eslint-disable-line

    const onSuccess = () => {
        invalidateByPatternMatch([API.FINANCE.EXPENSE.INDEX])
        closeModal()
        toast.success(
            expense ?
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

        if (expense) {
            doPatch(
                API.FINANCE.EXPENSE.ID.INDEX.replace(
                    "{id}",
                    String(expense.id),
                ),
                payload,
                { onSuccess },
            )
        } else {
            doPost(API.FINANCE.EXPENSE.INDEX, payload, { onSuccess })
        }
    })

    const entity = t("entity.expense")

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <CardTitle>
                {expense ?
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
                    autoFill={!expense}
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
                    {expense?.attachment && (
                        <a
                            href={expense.attachment}
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
                submitName={expense ? t("common.save") : t("common.add")}
                loading={isPending || fileReq.isPending}
            />
        </form>
    )
}
