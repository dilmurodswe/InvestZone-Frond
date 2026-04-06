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
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { useCurrenciesQuery } from "../-hooks/use-currencies-query"
import { usePaymentTypesQuery } from "../-hooks/use-payment-types-query"
import { useSalesAgentsQuery } from "../-hooks/use-sales-agents-query"
import type { Income, IncomeForm } from "../-types"

interface Props {
    income: Income | null
}

export default function IncomeAddEditModal({ income }: Props) {
    const { isOpen } = useModal("add-income")

    return (
        <Modal modalKey="add-income" title={null} className="md:max-w-lg">
            <IncomeFormInner
                key={`${income?.id ?? "new"}-${isOpen}`}
                income={income}
            />
        </Modal>
    )
}

function IncomeFormInner({ income }: Props) {
    const { closeModal } = useModal("add-income")
    const { invalidateByPatternMatch } = useRevalidate()
    const { post, patch, isPending } = useRequest()
    const { currencyList, isLoading: currLoading } = useCurrenciesQuery()
    const { paymentTypeList, isLoading: payLoading } = usePaymentTypesQuery()
    const { salesAgentList, isLoading: agentLoading } = useSalesAgentsQuery()

    const listsLoaded = !currLoading && !payLoading && !agentLoading
    const form = useForm<IncomeForm>({
        defaultValues: {
            name: income?.name ?? "",
            payment_type: null, // list kerak, pastda reset qilinadi
            currency: income?.currency?.id ?? null,
            current_rate: income?.current_rate ?? "",
            custom_rate: income?.custom_rate ?? "",
            date: income?.date ?? format(new Date(), "yyyy-MM-dd"),
            sales_agent: null, // list kerak, pastda reset qilinadi
            amount: income?.amount ?? "",
            comment: income?.comment ?? "",
        },
    })

    useEffect(() => {
        if (!income || !listsLoaded) return
        form.reset({
            name: income.name,
            payment_type:
                paymentTypeList.find((p) => p.name === income.payment_type)
                    ?.id ?? null,
            currency: income.currency?.id ?? null,
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
            income ? "Updated successfully" : "Income added successfully",
        )
    }

    const onSubmit = form.handleSubmit((vals) => {
        if (income) {
            patch(
                API.FINANCE.INCOME.ID.INDEX.replace("{id}", String(income.id)),
                vals,
                { onSuccess },
            )
        } else {
            post(API.FINANCE.INCOME.INDEX, vals, { onSuccess })
        }
    })

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>{income ? "Edit Income" : "Add Income"}</CardTitle>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <Label>Name</Label>
                    <Controller
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <Input {...field} placeholder="Enter name" />
                        )}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label>Amount</Label>
                    <Controller
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <Input {...field} placeholder="0.00" />
                        )}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label>Payment Type</Label>
                    <Controller
                        control={form.control}
                        name="payment_type"
                        render={({ field }) => (
                            <Select
                                value={field.value ? String(field.value) : ""}
                                onValueChange={(v) => field.onChange(Number(v))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select payment type" />
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

                <div className="flex flex-col gap-1.5">
                    <Label>Currency</Label>
                    <Controller
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                            <Select
                                value={field.value ? String(field.value) : ""}
                                onValueChange={(v) => field.onChange(Number(v))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
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

                <div className="flex flex-col gap-1.5">
                    <Label>Current Rate</Label>
                    <Controller
                        control={form.control}
                        name="current_rate"
                        render={({ field }) => (
                            <Input {...field} placeholder="0" type="number" />
                        )}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label>Custom Rate</Label>
                    <Controller
                        control={form.control}
                        name="custom_rate"
                        render={({ field }) => (
                            <Input {...field} placeholder="0" type="number" />
                        )}
                    />
                </div>

                <div className="flex flex-col gap-1.5 ">
                    <Label>Sales Agent</Label>
                    <Controller
                        control={form.control}
                        name="sales_agent"
                        render={({ field }) => (
                            <Select
                                value={field.value ? String(field.value) : ""}
                                onValueChange={(v) => field.onChange(Number(v))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select sales agent" />
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

                <div className="flex flex-col gap-1.5 col-span-2">
                    <Label>Date</Label>
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
                                        :   "Pick a date"}
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
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                </div>

                <div className="flex flex-col gap-1.5 col-span-2">
                    <Label>Comment</Label>
                    <Controller
                        control={form.control}
                        name="comment"
                        render={({ field }) => (
                            <Input {...field} placeholder="Enter comment" />
                        )}
                    />
                </div>
            </div>

            <FormAction
                submitName={income ? "Save" : "Add"}
                loading={isPending}
            />
        </form>
    )
}
