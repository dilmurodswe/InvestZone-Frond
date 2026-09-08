import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { formatNumber } from "@/lib/utils/format-number"
import { cn } from "@/lib/utils/shadcn"
import { endOfMonth, format, startOfMonth } from "date-fns"
import { CalendarIcon, TrendingDown, TrendingUp } from "lucide-react"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMutualSettlementsQuery } from "../-hooks/use-mutual-settlements-query"
import { CURRENCY_CODES, type CurrencyCode } from "../../-types"

const today = new Date()
const DEFAULT_START = format(startOfMonth(today), "yyyy-MM-dd")
const DEFAULT_END = format(endOfMonth(today), "yyyy-MM-dd")

const money = (v: unknown) =>
    formatNumber(v, { decimalScale: 2, isShowZero: true })

const tone = (v: number) =>
    v < 0 ? "text-red-500"
    : v > 0 ? "text-green-500"
    : ""

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

export default function MutualSettlementsPage() {
    const { t } = useTranslation()
    const [dates, setDates] = useState({
        start: DEFAULT_START,
        end: DEFAULT_END,
    })
    const [cur, setCur] = useState<CurrencyCode>("USD")
    const [search, setSearch] = useState("")

    const { rows, isFetching } = useMutualSettlementsQuery({
        start: dates.start,
        end: dates.end,
        currency: cur,
    })

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        const list =
            q ?
                rows.filter((r) => r.client_name.toLowerCase().includes(q))
            :   rows
        // Hide clients with no activity and a zero balance in this currency.
        return list.filter((r) => {
            const o = Number(r.opening[cur] ?? 0)
            const i = Number(r.income[cur] ?? 0)
            const e = Number(r.expense[cur] ?? 0)
            const c = Number(r.closing[cur] ?? 0)
            return o || i || e || c
        })
    }, [rows, search, cur])

    const totals = useMemo(() => {
        let owedToUs = 0 // sum of negative closings (client owes us)
        let weOwe = 0 // sum of positive closings (аванс)
        let income = 0
        let expense = 0
        for (const r of filtered) {
            const c = Number(r.closing[cur] ?? 0)
            if (c < 0) owedToUs += -c
            else weOwe += c
            income += Number(r.income[cur] ?? 0)
            expense += Number(r.expense[cur] ?? 0)
        }
        return { owedToUs, weOwe, income, expense }
    }, [filtered, cur])

    return (
        <>
            <Navbar links={[{ label: t("nav.mutualSettlements") }]} />
            <Layout>
                <div className="flex flex-col gap-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h1 className="text-xl font-bold">
                            {t("mutual.title")}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex gap-1">
                                {CURRENCY_CODES.map((c) => (
                                    <Button
                                        key={c}
                                        size="sm"
                                        variant={
                                            cur === c ? "default" : "outline"
                                        }
                                        className="h-8 px-3 text-xs"
                                        onClick={() => setCur(c)}
                                    >
                                        {c}
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

                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <SummaryCard
                            label={`${t("mutual.totalOwedToUs")} · ${cur}`}
                            value={totals.owedToUs}
                            kind="expense"
                        />
                        <SummaryCard
                            label={`${t("mutual.totalWeOwe")} · ${cur}`}
                            value={totals.weOwe}
                            kind="income"
                        />
                        <SummaryCard
                            label={`${t("mutual.income")} · ${cur}`}
                            value={totals.income}
                            kind="income"
                        />
                        <SummaryCard
                            label={`${t("mutual.expense")} · ${cur}`}
                            value={totals.expense}
                            kind="expense"
                        />
                    </div>

                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t("mutual.client")}
                        className="h-9 max-w-xs"
                    />

                    <Card>
                        <CardContent className="overflow-x-auto p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            {t("mutual.client")}
                                        </TableHead>
                                        <TableHead className="text-right">
                                            {t("mutual.opening")}
                                        </TableHead>
                                        <TableHead className="text-right">
                                            {t("mutual.income")}
                                        </TableHead>
                                        <TableHead className="text-right">
                                            {t("mutual.expense")}
                                        </TableHead>
                                        <TableHead className="text-right">
                                            {t("mutual.closing")}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isFetching && !filtered.length ?
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="h-24 text-center text-sm text-muted-foreground"
                                            >
                                                {t("common.loading")}
                                            </TableCell>
                                        </TableRow>
                                    : !filtered.length ?
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="h-24 text-center text-sm text-muted-foreground"
                                            >
                                                {t("common.noData")}
                                            </TableCell>
                                        </TableRow>
                                    :   filtered.map((r) => {
                                            const o = Number(
                                                r.opening[cur] ?? 0,
                                            )
                                            const i = Number(r.income[cur] ?? 0)
                                            const e = Number(
                                                r.expense[cur] ?? 0,
                                            )
                                            const c = Number(
                                                r.closing[cur] ?? 0,
                                            )
                                            return (
                                                <TableRow key={r.client_id}>
                                                    <TableCell className="font-medium">
                                                        {r.client_name}
                                                    </TableCell>
                                                    <TableCell
                                                        className={cn(
                                                            "text-right tabular-nums",
                                                            tone(o),
                                                        )}
                                                    >
                                                        {money(o)}
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums text-green-600">
                                                        {money(i)}
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums text-red-600">
                                                        {money(e)}
                                                    </TableCell>
                                                    <TableCell
                                                        className={cn(
                                                            "text-right font-semibold tabular-nums",
                                                            tone(c),
                                                        )}
                                                    >
                                                        {money(c)}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    }
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <p className="text-xs text-muted-foreground">
                        {t("client.openingBalanceHint")}
                    </p>
                </div>
            </Layout>
        </>
    )
}

function SummaryCard({
    label,
    value,
    kind,
}: {
    label: string
    value: number
    kind: "income" | "expense"
}) {
    const income = kind === "income"
    const Icon = income ? TrendingUp : TrendingDown
    return (
        <Card>
            <CardContent className="flex items-center gap-4 pt-6">
                <div
                    className={cn(
                        "rounded-xl p-3",
                        income ?
                            "bg-green-100 dark:bg-green-500/15"
                        :   "bg-red-100 dark:bg-red-500/15",
                    )}
                >
                    <Icon
                        className={cn(
                            "h-5 w-5",
                            income ? "text-green-600" : "text-red-600",
                        )}
                    />
                </div>
                <div className="min-w-0">
                    <p className="truncate text-xs text-muted-foreground">
                        {label}
                    </p>
                    <p
                        className={cn(
                            "text-xl font-bold tabular-nums",
                            income ? "text-green-600" : "text-red-600",
                        )}
                    >
                        {money(value)}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
