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
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { useCurrenciesQuery } from "../-hooks/use-currencies-query"
import { usePaymentTypesQuery } from "../-hooks/use-payment-types-query"
import type { Expense, ExpenseForm } from "../-types"

interface Props {
    expense: Expense | null
}

export default function ExpenseAddEditModal({ expense }: Props) {
    return (
        <Modal modalKey="add-expense" title={null} className="md:max-w-lg">
            <ExpenseFormInner expense={expense} />
        </Modal>
    )
}

function ExpenseFormInner({ expense }: Props) {
    const { closeModal } = useModal("add-expense")
    const { invalidateByPatternMatch } = useRevalidate()
    const { post, patch, isPending } = useRequest()
    const { currencyList } = useCurrenciesQuery()
    const { paymentTypeList } = usePaymentTypesQuery()

    const form = useForm<ExpenseForm>({
        defaultValues: {
            name: "",
            payment_type: null,
            currency: null,
            current_rate: "",
            custom_rate: "",
            date: format(new Date(), "yyyy-MM-dd"),
            amount: "",
            comment: "",
        },
        values:
            expense ?
                {
                    name: expense.name,
                    payment_type:
                        paymentTypeList.find(
                            (p) => p.name === expense.payment_type,
                        )?.id ?? null,
                    currency: expense.currency?.id ?? null,
                    current_rate: expense.current_rate,
                    custom_rate: expense.custom_rate,
                    date: expense.date,
                    amount: expense.amount,
                    comment: expense.comment,
                }
            :   undefined,
    })

    const onSuccess = () => {
        invalidateByPatternMatch([API.FINANCE.EXPENSE.INDEX])
        closeModal()
        toast.success(
            expense ? "Updated successfully" : "Expense added successfully",
        )
    }

    const onSubmit = form.handleSubmit((vals) => {
        if (expense) {
            patch(
                API.FINANCE.EXPENSE.ID.INDEX.replace(
                    "{id}",
                    String(expense.id),
                ),
                vals,
                { onSuccess },
            )
        } else {
            post(API.FINANCE.EXPENSE.INDEX, vals, { onSuccess })
        }
    })

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <CardTitle>{expense ? "Edit Expense" : "Add Expense"}</CardTitle>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <Label>Name</Label>
                    <Input
                        {...form.register("name")}
                        placeholder="Enter name"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label>Amount</Label>
                    <Input {...form.register("amount")} placeholder="0.00" />
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
                    <Input
                        {...form.register("current_rate")}
                        placeholder="0"
                        type="number"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label>Custom Rate</Label>
                    <Input
                        {...form.register("custom_rate")}
                        placeholder="0"
                        type="number"
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
                    <Input
                        {...form.register("comment")}
                        placeholder="Enter comment"
                    />
                </div>
            </div>

            <FormAction
                submitName={expense ? "Save" : "Add"}
                loading={isPending}
            />
        </form>
    )
}
