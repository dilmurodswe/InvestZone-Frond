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
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { NumericFormat } from "react-number-format"
import { toast } from "sonner"
import { usePayrollEmployeesQuery } from "../-hooks/use-salary-queries"
import type { SalaryIssueForm, SalaryKind, SalaryTransaction } from "../-types"
import { usePaymentTypesQuery } from "../../expence/-hooks/use-payment-types-query"

const MODAL_KEY = "salary-issue"
const KINDS: SalaryKind[] = ["advance", "penalty", "bonus"]

type Props = { transaction?: SalaryTransaction | null }

export default function SalaryIssueModal({ transaction }: Props) {
    const { isOpen } = useModal(MODAL_KEY)
    return (
        <Modal
            modalKey={MODAL_KEY}
            title={null}
            className="md:max-w-xl"
            wrapperClassname="md:max-w-xl"
        >
            <Inner
                key={`${transaction?.id ?? "new"}-${isOpen}`}
                transaction={transaction ?? null}
            />
        </Modal>
    )
}

function Inner({ transaction }: { transaction: SalaryTransaction | null }) {
    const { t } = useTranslation()
    const { closeModal } = useModal(MODAL_KEY)
    const { invalidateByPatternMatch } = useRevalidate()
    const { post, patch, isPending } = useRequest()
    const fileReq = useRequest({
        config: { headers: { "Content-Type": null } },
    })
    const { employeeList } = usePayrollEmployeesQuery()
    const { paymentTypeList } = usePaymentTypesQuery()

    const form = useForm<SalaryIssueForm>({
        defaultValues: {
            employee: transaction?.employee ?? null,
            kind: transaction?.kind ?? "advance",
            amount: transaction?.amount ?? "",
            payment_type: transaction?.payment_type ?? null,
            date: transaction?.date ?? format(new Date(), "yyyy-MM-dd"),
            comment: transaction?.comment ?? "",
            attachment: null,
        },
    })

    const onSubmit = form.handleSubmit((vals) => {
        const { attachment, ...rest } = vals
        const hasFile = attachment instanceof File
        const payload = hasFile ? toFormData({ ...rest, attachment }) : rest
        const done = () => {
            invalidateByPatternMatch([
                API.FINANCE.SALARY_TRANSACTIONS.INDEX,
                API.FINANCE.PAYROLL.INDEX,
                API.FINANCE.EXPENSE.INDEX,
                API.FINANCE.INCOME.INDEX,
            ])
            closeModal()
            toast.success(
                transaction ?
                    t("common.updatedSuccessfully")
                :   t("common.addedSuccessfully"),
            )
        }
        if (transaction) {
            const doPatch = hasFile ? fileReq.patch : patch
            doPatch(
                API.FINANCE.SALARY_TRANSACTIONS.ID.INDEX.replace(
                    "{id}",
                    String(transaction.id),
                ),
                payload,
                { onSuccess: done },
            )
        } else {
            const doPost = hasFile ? fileReq.post : post
            doPost(API.FINANCE.SALARY_TRANSACTIONS.INDEX, payload, {
                onSuccess: done,
            })
        }
    })

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <CardTitle>
                {transaction ?
                    t("common.editEntity", { entity: t("salary.issue") })
                :   t("salary.issueTitle")}
            </CardTitle>

            <div className="grid grid-cols-1 items-start gap-x-6 gap-y-5 sm:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
                    <Label>{t("salary.employee")}</Label>
                    <Controller
                        control={form.control}
                        name="employee"
                        rules={{ required: true }}
                        render={({ field, fieldState }) => (
                            <Select
                                value={field.value ? String(field.value) : ""}
                                onValueChange={(v) => field.onChange(Number(v))}
                            >
                                <SelectTrigger
                                    className={cn(
                                        "w-full min-w-0",
                                        fieldState.error &&
                                            "border-destructive",
                                    )}
                                >
                                    <SelectValue
                                        placeholder={t("common.select")}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {employeeList.map((e) => (
                                        <SelectItem
                                            key={e.id}
                                            value={String(e.id)}
                                        >
                                            {e.full_name}
                                            {e.position ?
                                                ` — ${e.position}`
                                            :   ""}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className="flex min-w-0 flex-col gap-1.5">
                    <Label>{t("salary.action")}</Label>
                    <Controller
                        control={form.control}
                        name="kind"
                        render={({ field }) => (
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                            >
                                <SelectTrigger className="w-full min-w-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {KINDS.map((k) => (
                                        <SelectItem key={k} value={k}>
                                            {t(`salary.${k}` as const)}
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
                        rules={{ required: true }}
                        render={({ field, fieldState }) => (
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
                                className={cn(
                                    fieldState.error && "border-destructive",
                                )}
                            />
                        )}
                    />
                </div>

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
                                        {field.value || t("common.pickDate")}
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

                <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
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

                <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
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
                    {transaction?.attachment && (
                        <a
                            href={transaction.attachment}
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
                submitName={transaction ? t("common.save") : t("common.add")}
                loading={isPending || fileReq.isPending}
            />
        </form>
    )
}
