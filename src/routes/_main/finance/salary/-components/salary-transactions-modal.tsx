import Modal from "@/components/custom/modal"
import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { formatNumber } from "@/lib/utils/format-number"
import { cn } from "@/lib/utils/shadcn"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useSalaryTransactionsQuery } from "../-hooks/use-salary-queries"
import type { SalaryKind, SalaryTransaction } from "../-types"

const MODAL_KEY = "salary-transactions"

const KIND_STYLE: Record<SalaryKind, string> = {
    advance:
        "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    penalty: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
    bonus: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
}

type Props = {
    employee: { id: number; name: string } | null
    month: string
    onEdit: (txn: SalaryTransaction) => void
    onAdd: (employeeId: number) => void
}

export default function SalaryTransactionsModal({
    employee,
    month,
    onEdit,
    onAdd,
}: Props) {
    const { isOpen } = useModal(MODAL_KEY)

    return (
        <Modal
            modalKey={MODAL_KEY}
            title={null}
            className="md:max-w-2xl"
            wrapperClassname="md:max-w-2xl"
        >
            {isOpen && employee && (
                <Inner
                    employee={employee}
                    month={month}
                    onEdit={onEdit}
                    onAdd={onAdd}
                />
            )}
        </Modal>
    )
}

function Inner({
    employee,
    month,
    onEdit,
    onAdd,
}: Props & { employee: { id: number; name: string } }) {
    const { t } = useTranslation()
    const { invalidateByPatternMatch } = useRevalidate()
    const { remove, isPending } = useRequest()
    const { transactionList, isFetching } = useSalaryTransactionsQuery(
        employee.id,
        month,
    )

    const onDelete = (txn: SalaryTransaction) => {
        if (!window.confirm(t("common.deleteConfirm"))) return
        remove(
            API.FINANCE.SALARY_TRANSACTIONS.ID.INDEX.replace(
                "{id}",
                String(txn.id),
            ),
            undefined,
            {
                onSuccess: () =>
                    invalidateByPatternMatch([
                        API.FINANCE.SALARY_TRANSACTIONS.INDEX,
                        API.FINANCE.PAYROLL.INDEX,
                        API.FINANCE.EXPENSE.INDEX,
                        API.FINANCE.INCOME.INDEX,
                    ]),
            },
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <CardTitle>{employee.name}</CardTitle>
                <Button size="sm" onClick={() => onAdd(employee.id)}>
                    <Plus className="size-4" />
                    {t("salary.issue")}
                </Button>
            </div>

            <div className="max-h-[55vh] overflow-auto rounded-md border">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted/60 text-xs text-muted-foreground">
                        <tr>
                            <th className="px-3 py-2 text-left">
                                {t("salary.action")}
                            </th>
                            <th className="px-3 py-2 text-right">
                                {t("table.amount")}
                            </th>
                            <th className="px-3 py-2 text-left">
                                {t("table.date")}
                            </th>
                            <th className="px-3 py-2 text-left">
                                {t("finCat.kassa")}
                            </th>
                            <th className="px-3 py-2 text-left">
                                {t("table.comment")}
                            </th>
                            <th className="px-3 py-2" />
                        </tr>
                    </thead>
                    <tbody>
                        {transactionList.map((txn) => (
                            <tr key={txn.id} className="border-t">
                                <td className="px-3 py-2">
                                    <span
                                        className={cn(
                                            "rounded px-2 py-0.5 text-xs font-medium",
                                            KIND_STYLE[txn.kind],
                                        )}
                                    >
                                        {t(`salary.${txn.kind}` as const)}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">
                                    {formatNumber(txn.amount, {
                                        decimalScale: 0,
                                    })}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                    {txn.date}
                                </td>
                                <td className="px-3 py-2">
                                    {txn.payment_type_name ?? "—"}
                                </td>
                                <td className="px-3 py-2">
                                    {txn.comment ?? "—"}
                                </td>
                                <td className="px-3 py-2">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            className="text-muted-foreground hover:text-primary"
                                            onClick={() => onEdit(txn)}
                                        >
                                            <Pencil className="size-4" />
                                        </button>
                                        <button
                                            type="button"
                                            disabled={isPending}
                                            className="text-muted-foreground hover:text-destructive disabled:opacity-50"
                                            onClick={() => onDelete(txn)}
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!transactionList.length && !isFetching && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-3 py-8 text-center text-muted-foreground"
                                >
                                    {t("salary.noTransactions")}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
