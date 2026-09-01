import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import NoData from "@/components/no-data/nodata"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { formatNumber } from "@/lib/utils/format-number"
import { cn } from "@/lib/utils/shadcn"
import { Printer, Send } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { usePayrollQuery } from "../-hooks/use-salary-queries"
import type { PayrollRow, SalaryTransaction } from "../-types"
import SalaryIssueModal from "./salary-issue-modal"
import SalaryTransactionsModal from "./salary-transactions-modal"

const thisMonth = () => new Date().toISOString().slice(0, 7)
const num = (v: unknown) => formatNumber(v, { decimalScale: 0 })

export default function SalaryPage() {
    const { t } = useTranslation()
    const [month, setMonth] = useState(() => thisMonth())
    const { payrollList, isFetching } = usePayrollQuery(month)
    const { invalidateByPatternMatch } = useRevalidate()
    const { patchAsync } = useRequest()
    const issueModal = useModal("salary-issue")
    const txnsModal = useModal("salary-transactions")

    const [editingTxn, setEditingTxn] = useState<SalaryTransaction | null>(null)
    const [activeEmployee, setActiveEmployee] = useState<{
        id: number
        name: string
    } | null>(null)

    const rowUrl = (id: number) =>
        API.FINANCE.PAYROLL.ID.INDEX.replace("{id}", String(id))

    const patchRow = async (id: number, patch: Record<string, unknown>) => {
        await patchAsync(rowUrl(id), patch)
        invalidateByPatternMatch([API.FINANCE.PAYROLL.INDEX])
    }

    const setPayoutDateAll = async (date: string) => {
        await Promise.all(
            payrollList.map((r) =>
                patchAsync(rowUrl(r.id), { payout_date: date || null }),
            ),
        )
        invalidateByPatternMatch([API.FINANCE.PAYROLL.INDEX])
    }

    const openTxns = (row: PayrollRow) => {
        setActiveEmployee({ id: row.employee, name: row.full_name })
        txnsModal.openModal()
    }

    const openIssueNew = () => {
        setEditingTxn(null)
        setActiveEmployee(null)
        issueModal.openModal()
    }

    const totals = payrollList.reduce(
        (acc, r) => ({
            base: acc.base + Number(r.base_salary || 0),
            advance: acc.advance + Number(r.advance_total || 0),
            penalty: acc.penalty + Number(r.penalty_total || 0),
            bonus: acc.bonus + Number(r.bonus_total || 0),
            accrued: acc.accrued + Number(r.accrued || 0),
        }),
        { base: 0, advance: 0, penalty: 0, bonus: 0, accrued: 0 },
    )

    const payoutDate = payrollList.find((r) => r.payout_date)?.payout_date ?? ""

    return (
        <>
            <Navbar links={[{ label: t("salary.title") }]} />
            <Layout>
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3 print:hidden">
                    <div className="flex flex-wrap items-end gap-3">
                        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                            {t("salary.month")}
                            <Input
                                type="month"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="w-44"
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                            {t("salary.payoutDate")}
                            <Input
                                type="date"
                                defaultValue={payoutDate}
                                onBlur={(e) => setPayoutDateAll(e.target.value)}
                                className="w-44"
                            />
                        </label>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => window.print()}
                        >
                            <Printer className="size-4" />
                            {t("common.print")}
                        </Button>
                        <Button onClick={openIssueNew}>
                            <Send className="size-4" />
                            {t("salary.issue")}
                        </Button>
                    </div>
                </div>

                {!payrollList.length && !isFetching ?
                    <NoData>{t("salary.noEmployeesHint")}</NoData>
                :   <div className="overflow-auto rounded-md border bg-background">
                        <table className="w-full text-sm [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
                            <thead className="bg-muted/60 text-xs text-muted-foreground">
                                <tr>
                                    <th className="px-3 py-2 text-left">#</th>
                                    <th className="px-3 py-2 text-left">
                                        {t("table.name")}
                                    </th>
                                    <th className="px-3 py-2 text-left">
                                        {t("salary.department")}
                                    </th>
                                    <th className="px-3 py-2 text-left">
                                        {t("salary.position")}
                                    </th>
                                    <th className="px-3 py-2 text-right">
                                        {t("salary.code")}
                                    </th>
                                    <th className="px-3 py-2 text-right">
                                        {t("salary.baseSalary")}
                                    </th>
                                    <th className="px-3 py-2 text-left">
                                        {t("salary.rateUnit")}
                                    </th>
                                    <th className="px-3 py-2 text-right">
                                        {t("salary.norm")}
                                    </th>
                                    <th className="px-3 py-2 text-right">
                                        {t("salary.worked")}
                                    </th>
                                    <th className="px-3 py-2 text-right">
                                        {t("salary.advance")}
                                    </th>
                                    <th className="px-3 py-2 text-right">
                                        {t("salary.penalty")}
                                    </th>
                                    <th className="px-3 py-2 text-right">
                                        {t("salary.bonus")}
                                    </th>
                                    <th className="px-3 py-2 text-right">
                                        {t("salary.accrued")}
                                    </th>
                                    <th className="px-3 py-2 text-left">
                                        {t("table.comment")}
                                    </th>
                                    <th className="px-3 py-2 text-center">
                                        {t("salary.posted")}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {payrollList.map((row, i) => (
                                    <Row
                                        key={row.id}
                                        index={i + 1}
                                        row={row}
                                        onPatch={patchRow}
                                        onOpenTxns={() => openTxns(row)}
                                    />
                                ))}
                            </tbody>
                            <tfoot className="border-t-2 bg-muted/40 font-semibold">
                                <tr>
                                    <td className="px-3 py-2" colSpan={5}>
                                        {t("salary.total")}
                                    </td>
                                    <td className="px-3 py-2 text-right tabular-nums">
                                        {num(totals.base)}
                                    </td>
                                    <td colSpan={3} />
                                    <td className="px-3 py-2 text-right tabular-nums">
                                        {num(totals.advance)}
                                    </td>
                                    <td className="px-3 py-2 text-right tabular-nums">
                                        {num(totals.penalty)}
                                    </td>
                                    <td className="px-3 py-2 text-right tabular-nums">
                                        {num(totals.bonus)}
                                    </td>
                                    <td className="px-3 py-2 text-right tabular-nums">
                                        {num(totals.accrued)}
                                    </td>
                                    <td colSpan={2} />
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                }

                <SalaryIssueModal transaction={editingTxn} />
                <SalaryTransactionsModal
                    employee={activeEmployee}
                    month={month}
                    onEdit={(txn) => {
                        setEditingTxn(txn)
                        txnsModal.closeModal()
                        issueModal.openModal()
                    }}
                    onAdd={() => {
                        setEditingTxn(null)
                        txnsModal.closeModal()
                        issueModal.openModal()
                    }}
                />
            </Layout>
        </>
    )
}

function Row({
    index,
    row,
    onPatch,
    onOpenTxns,
}: {
    index: number
    row: PayrollRow
    onPatch: (id: number, patch: Record<string, unknown>) => Promise<void>
    onOpenTxns: () => void
}) {
    const { t } = useTranslation()
    const [worked, setWorked] = useState(row.worked ?? "")
    const [norm, setNorm] = useState(row.norm ?? "")
    const [comment, setComment] = useState(row.comment ?? "")
    const locked = row.posted

    const commitNumber = (field: string, value: string, original: string) => {
        if (value === (original ?? "")) return
        onPatch(row.id, { [field]: value === "" ? 0 : value })
    }
    const commitText = (field: string, value: string, original: string) => {
        if (value === (original ?? "")) return
        onPatch(row.id, { [field]: value })
    }

    const moneyBtn =
        "cursor-pointer rounded px-1 tabular-nums hover:bg-muted hover:underline"

    return (
        <tr
            className={cn(
                "border-t",
                locked && "bg-muted/30 text-muted-foreground",
            )}
        >
            <td className="px-3 py-1.5 text-muted-foreground">{index}</td>
            <td className="px-3 py-1.5 font-medium">{row.full_name}</td>
            <td className="px-3 py-1.5">{row.department ?? "—"}</td>
            <td className="px-3 py-1.5">{row.position ?? "—"}</td>
            <td className="px-3 py-1.5 text-right tabular-nums">
                {row.code ?? "—"}
            </td>
            <td className="px-3 py-1.5 text-right tabular-nums">
                {num(row.base_salary)}
            </td>
            <td className="px-3 py-1.5">{t(`salary.unit_${row.rate_unit}`)}</td>
            <td className="px-2 py-1 text-right">
                <input
                    inputMode="decimal"
                    disabled={locked}
                    value={norm}
                    onChange={(e) => setNorm(e.target.value)}
                    onBlur={() => commitNumber("norm", norm, row.norm)}
                    className="w-16 rounded border bg-transparent px-2 py-1 text-right tabular-nums disabled:opacity-60"
                />
            </td>
            <td className="px-2 py-1 text-right">
                <input
                    inputMode="decimal"
                    disabled={locked}
                    value={worked}
                    onChange={(e) => setWorked(e.target.value)}
                    onBlur={() => commitNumber("worked", worked, row.worked)}
                    className="w-16 rounded border bg-transparent px-2 py-1 text-right tabular-nums disabled:opacity-60"
                />
            </td>
            <td className="px-3 py-1.5 text-right">
                <button type="button" className={moneyBtn} onClick={onOpenTxns}>
                    {num(row.advance_total)}
                </button>
            </td>
            <td className="px-3 py-1.5 text-right">
                <button type="button" className={moneyBtn} onClick={onOpenTxns}>
                    {num(row.penalty_total)}
                </button>
            </td>
            <td className="px-3 py-1.5 text-right">
                <button type="button" className={moneyBtn} onClick={onOpenTxns}>
                    {num(row.bonus_total)}
                </button>
            </td>
            <td className="px-3 py-1.5 text-right font-semibold tabular-nums">
                {num(row.accrued)}
            </td>
            <td className="px-2 py-1">
                <input
                    disabled={locked}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onBlur={() =>
                        commitText("comment", comment, row.comment ?? "")
                    }
                    className="w-40 rounded border bg-transparent px-2 py-1 disabled:opacity-60"
                />
            </td>
            <td className="px-3 py-1.5 text-center">
                <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={row.posted}
                    onChange={(e) =>
                        onPatch(row.id, { posted: e.target.checked })
                    }
                />
            </td>
        </tr>
    )
}
