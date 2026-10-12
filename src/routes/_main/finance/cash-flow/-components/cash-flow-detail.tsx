import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { formatNumber } from "@/lib/utils/format-number"
import { cn } from "@/lib/utils/shadcn"
import { PaperclipIcon } from "lucide-react"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import type { CashFlowRow } from "../-types"
import OriginBadge from "../../-components/origin-badge"
import type { Income } from "../../income/-types"

const money = (v: unknown) =>
    formatNumber(v, { decimalScale: 2, isShowZero: true })

/** Income and expense share every field the panel shows; income adds an order. */
type FinanceDoc = Omit<Income, "current_rate" | "custom_rate"> & {
    current_rate: string | number
    custom_rate: string | number
}

type Props = {
    row: CashFlowRow | null
    onClose: () => void
}

/** Centered dialog with the full income / expense behind a cash-flow row. */
export default function CashFlowDetail({ row, onClose }: Props) {
    const { t } = useTranslation()
    const income = row?.type === "income"
    const url =
        row ?
            (income ?
                API.FINANCE.INCOME.ID.INDEX
            :   API.FINANCE.EXPENSE.ID.INDEX
            ).replace("{id}", String(row.id))
        :   ""
    const { data, isFetching } = useGet<FinanceDoc>(url, {
        options: { enabled: !!row },
    })
    const doc = row && data?.id === row.id ? data : null

    return (
        <Dialog open={!!row} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                wrapperClassname="p-0 py-0 md:py-0 md:max-w-lg overflow-hidden"
                className="max-h-[85vh] p-0"
                closeButtonClassName="top-4 right-4 text-foreground [&_svg]:size-5"
            >
                {row && (
                    <>
                        <DialogHeader className="gap-1.5 border-b p-5 pr-12 text-left">
                            <span
                                className={cn(
                                    "w-fit rounded px-2 py-0.5 text-xs font-medium",
                                    income ?
                                        "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300"
                                    :   "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
                                )}
                            >
                                {income ?
                                    t("finCat.income")
                                :   t("finCat.expense")}
                            </span>
                            <DialogTitle className="text-lg">
                                {row.doc_no} · {row.date}
                            </DialogTitle>
                            <DialogDescription>{row.purpose}</DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col gap-1 border-b px-5 py-4">
                            <span className="text-xs text-muted-foreground">
                                {t("table.amount")}
                            </span>
                            <span
                                className={cn(
                                    "text-2xl font-bold tabular-nums",
                                    income ?
                                        "text-green-600 dark:text-green-500"
                                    :   "text-red-600 dark:text-red-500",
                                )}
                            >
                                {income ? "+" : "−"}
                                {money(row.original_amount ?? row.amount)}{" "}
                                {row.original_currency ?? row.currency}
                            </span>
                            {row.original_currency && (
                                <span className="text-sm tabular-nums text-muted-foreground">
                                    {row.converted === false ?
                                        t("cashFlow.noRate")
                                    :   <>
                                            ≈ {money(row.amount)} {row.currency}
                                        </>
                                    }
                                </span>
                            )}
                        </div>

                        <dl className="flex flex-col px-5 py-3 text-sm">
                            <Field label={t("finCat.kassa")}>
                                {row.payment_type_name}
                            </Field>
                            <Field label={t("cashFlow.balance")}>
                                <span className="tabular-nums">
                                    {money(row.balance_after)} {row.currency}
                                </span>
                            </Field>

                            {isFetching && !doc ?
                                <div className="flex flex-col gap-3 py-3">
                                    {[0, 1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-5" />
                                    ))}
                                </div>
                            : doc ?
                                <>
                                    <Field label={t("table.currentRate")}>
                                        {rate(doc.current_rate)}
                                    </Field>
                                    <Field label={t("table.customRate")}>
                                        {rate(doc.custom_rate)}
                                    </Field>
                                    {income && (
                                        <>
                                            <Field label={t("table.order")}>
                                                {doc.order_number ?
                                                    `№${doc.order_number}`
                                                :   "—"}
                                            </Field>
                                            <Field label={t("table.client")}>
                                                {doc.client_name || "—"}
                                            </Field>
                                        </>
                                    )}
                                    <Field label={t("entity.category")}>
                                        {doc.category?.name ?? "—"}
                                    </Field>
                                    <Field label={t("entity.subcategory")}>
                                        {doc.subcategory?.name ?? "—"}
                                    </Field>
                                    <Field label={t("salary.source")}>
                                        <OriginBadge origin={doc.origin} />
                                    </Field>
                                    <Field label={t("table.comment")} block>
                                        {doc.comment?.trim() || "—"}
                                    </Field>
                                    {doc.attachment && (
                                        <Field
                                            label={t("finCat.currentFile")}
                                            block
                                        >
                                            <a
                                                href={doc.attachment}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 break-all text-primary hover:underline"
                                            >
                                                <PaperclipIcon className="size-4 shrink-0" />
                                                {fileName(doc.attachment)}
                                            </a>
                                        </Field>
                                    )}
                                </>
                            :   null}
                        </dl>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}

const rate = (v: unknown) => (Number(v) ? formatNumber(v) : "—")

const fileName = (url: string) =>
    decodeURIComponent(url.split("?")[0].split("/").pop() || url)

function Field({
    label,
    children,
    block,
}: {
    label: string
    children: ReactNode
    block?: boolean
}) {
    return (
        <div
            className={cn(
                "border-b py-2.5 last:border-b-0",
                block ?
                    "flex flex-col gap-1"
                :   "flex items-start justify-between gap-4",
            )}
        >
            <dt className="shrink-0 text-muted-foreground">{label}</dt>
            <dd
                className={cn(
                    "min-w-0 break-words",
                    block ? "whitespace-pre-wrap" : "text-right",
                )}
            >
                {children}
            </dd>
        </div>
    )
}
