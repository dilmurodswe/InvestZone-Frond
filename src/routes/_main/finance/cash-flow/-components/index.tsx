import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { formatNumber } from "@/lib/utils/format-number"
import { cn } from "@/lib/utils/shadcn"
import { endOfMonth, format, startOfMonth } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useCashFlowQuery } from "../-hooks/use-cash-flow"
import type { CashCurrency } from "../-types"

const today = new Date()
const DEFAULT_START = format(startOfMonth(today), "yyyy-MM-dd")
const DEFAULT_END = format(endOfMonth(today), "yyyy-MM-dd")

const money = (v: unknown) =>
    formatNumber(v, { decimalScale: 2, isShowZero: true })

type PaymentType = { id: number; name: string }

function DatePick({
    value,
    onChange,
    align,
}: {
    value: string
    onChange: (d: string) => void
    align: "start" | "end"
}) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                >
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {value}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align={align}>
                <Calendar
                    mode="single"
                    selected={new Date(value)}
                    onSelect={(d) => d && onChange(format(d, "yyyy-MM-dd"))}
                />
            </PopoverContent>
        </Popover>
    )
}

export default function CashFlowPage() {
    const { t } = useTranslation()
    const [paymentType, setPaymentType] = useState<string>("all")
    const [currency, setCurrency] = useState<CashCurrency | "">("")
    const [dates, setDates] = useState({
        start: DEFAULT_START,
        end: DEFAULT_END,
    })

    const { data: ptData } = useGet<{ results: PaymentType[] }>(
        API.SETTINGS.PAYMENT_TYPE.INDEX,
        { params: { page_size: 200 } },
    )
    const paymentTypes = ptData?.results ?? []

    const { rows, opening, closing, isFetching } = useCashFlowQuery({
        paymentType: paymentType === "all" ? "" : paymentType,
        currency,
        start: dates.start,
        end: dates.end,
    })

    const shownCurrencies: CashCurrency[] =
        currency ? [currency] : ["UZS", "USD"]

    return (
        <>
            <Navbar links={[{ label: t("nav.cashFlow") }]} />
            <Layout>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h1 className="text-xl font-bold">
                            {t("nav.cashFlow")}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2">
                            <Select
                                value={paymentType}
                                onValueChange={setPaymentType}
                            >
                                <SelectTrigger className="h-8 w-40 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        {t("finCat.kassa")}: {t("common.all")}
                                    </SelectItem>
                                    {paymentTypes.map((p) => (
                                        <SelectItem
                                            key={p.id}
                                            value={String(p.id)}
                                        >
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="flex gap-1">
                                {(["", "UZS", "USD"] as const).map((c) => (
                                    <Button
                                        key={c || "all"}
                                        size="sm"
                                        variant={
                                            currency === c ? "default" : (
                                                "outline"
                                            )
                                        }
                                        className="h-8 px-3 text-xs"
                                        onClick={() => setCurrency(c)}
                                    >
                                        {c || t("common.all")}
                                    </Button>
                                ))}
                            </div>

                            <DatePick
                                value={dates.start}
                                onChange={(d) =>
                                    setDates((p) => ({ ...p, start: d }))
                                }
                                align="start"
                            />
                            <span className="text-xs text-muted-foreground">
                                —
                            </span>
                            <DatePick
                                value={dates.end}
                                onChange={(d) =>
                                    setDates((p) => ({ ...p, end: d }))
                                }
                                align="end"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {shownCurrencies.map((c) => (
                            <Card key={`open-${c}`}>
                                <CardContent className="pt-4">
                                    <p className="text-xs text-muted-foreground">
                                        {t("cashFlow.opening")} · {c}
                                    </p>
                                    <p className="text-lg font-bold tabular-nums">
                                        {money(opening[c] ?? 0)}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                        {shownCurrencies.map((c) => (
                            <Card key={`close-${c}`}>
                                <CardContent className="pt-4">
                                    <p className="text-xs text-muted-foreground">
                                        {t("cashFlow.closing")} · {c}
                                    </p>
                                    <p className="text-lg font-bold tabular-nums text-primary">
                                        {money(closing[c] ?? 0)}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("table.date")}</TableHead>
                                        <TableHead>
                                            {t("cashFlow.docNo")}
                                        </TableHead>
                                        <TableHead>
                                            {t("finCat.kassa")}
                                        </TableHead>
                                        <TableHead>
                                            {t("cashFlow.purpose")}
                                        </TableHead>
                                        <TableHead className="text-right">
                                            {t("table.amount")}
                                        </TableHead>
                                        <TableHead className="text-right">
                                            {t("cashFlow.balance")}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((r) => {
                                        const income = r.type === "income"
                                        return (
                                            <TableRow key={`${r.type}-${r.id}`}>
                                                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                                    {r.date}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap text-xs">
                                                    {r.doc_no}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap text-xs">
                                                    {r.payment_type_name}
                                                </TableCell>
                                                <TableCell className="max-w-md text-xs">
                                                    {r.purpose}
                                                </TableCell>
                                                <TableCell
                                                    className={cn(
                                                        "whitespace-nowrap text-right text-sm font-semibold tabular-nums",
                                                        income ?
                                                            "text-green-600 dark:text-green-500"
                                                        :   "text-red-600 dark:text-red-500",
                                                    )}
                                                >
                                                    {income ? "+" : "−"}
                                                    {money(r.amount)}{" "}
                                                    {r.currency}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap text-right text-sm tabular-nums">
                                                    {money(r.balance_after)}{" "}
                                                    {r.currency}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                    {!rows.length && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="py-10 text-center text-sm text-muted-foreground"
                                            >
                                                {isFetching ?
                                                    t("common.loading")
                                                :   t("common.noData")}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        </>
    )
}
