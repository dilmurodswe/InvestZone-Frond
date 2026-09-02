import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { formatNumber } from "@/lib/utils/format-number"
import { cn } from "@/lib/utils/shadcn"
import { createFileRoute } from "@tanstack/react-router"
import { endOfMonth, format, startOfMonth } from "date-fns"
import { CalendarIcon, TrendingDown, TrendingUp, Wallet } from "lucide-react"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

export const Route = createFileRoute("/_main/finance/dashboard/")({
    component: RouteComponent,
})

const today = new Date()
const DEFAULT_START = format(startOfMonth(today), "yyyy-MM-dd")
const DEFAULT_END = format(endOfMonth(today), "yyyy-MM-dd")

const INCOME_COLOR = "#22c55e"
const EXPENSE_COLOR = "#ef4444"
const SLICE_COLORS = [
    "#6366f1",
    "#f59e0b",
    "#06b6d4",
    "#ec4899",
    "#84cc16",
    "#8b5cf6",
    "#f97316",
    "#14b8a6",
]

type Currency = "UZS" | "USD"
type StatItem = { date: string; USD: number; UZS: number }
type PaymentBucket = {
    income_total: number
    expense_total: number
    items: { name: string; income: number; expense: number }[]
}
type PaymentStats = Record<string, PaymentBucket>

const money = (v: unknown) => formatNumber(v, { decimalScale: 0 })
const compact = (v: number) => {
    const a = Math.abs(v)
    if (a >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
    if (a >= 1_000) return `${Math.round(v / 1_000)}k`
    return String(v)
}

function DateRangePicker({
    startDate,
    endDate,
    onStartChange,
    onEndChange,
}: {
    startDate: string
    endDate: string
    onStartChange: (d: string) => void
    onEndChange: (d: string) => void
}) {
    const pick = (
        value: string,
        onChange: (d: string) => void,
        align: "start" | "end",
    ) => (
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

    return (
        <div className="flex items-center gap-2">
            {pick(startDate, onStartChange, "start")}
            <span className="text-xs text-muted-foreground">—</span>
            {pick(endDate, onEndChange, "end")}
        </div>
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

function RouteComponent() {
    const { t } = useTranslation()
    const [dates, setDates] = useState({
        start: DEFAULT_START,
        end: DEFAULT_END,
    })
    const [cur, setCur] = useState<Currency>("UZS")

    const params = { start_date: dates.start, end_date: dates.end }
    const opts = { staleTime: 0, refetchOnMount: "always" as const }

    const { data: expenseData, isLoading: expenseLoading } = useGet<StatItem[]>(
        API.DASHBOARD.EXPENSE_STATS,
        { params, options: opts },
    )
    const { data: incomeData, isLoading: incomeLoading } = useGet<StatItem[]>(
        API.DASHBOARD.INCOME_STATS,
        { params, options: opts },
    )
    const { data: paymentData, isLoading: paymentLoading } =
        useGet<PaymentStats>(API.DASHBOARD.PAYMENT_TYPE_STATS, {
            params,
            options: opts,
        })

    const chartData = useMemo(
        () =>
            (expenseData ?? []).map((e, i) => ({
                date: e.date,
                expense: e[cur],
                income: incomeData?.[i]?.[cur] ?? 0,
            })),
        [expenseData, incomeData, cur],
    )

    const totals = useMemo(() => {
        const sum = (d: StatItem[] | undefined, c: Currency) =>
            (d ?? []).reduce((s, i) => s + (i[c] || 0), 0)
        return {
            incomeUZS: sum(incomeData, "UZS"),
            incomeUSD: sum(incomeData, "USD"),
            expenseUZS: sum(expenseData, "UZS"),
            expenseUSD: sum(expenseData, "USD"),
        }
    }, [incomeData, expenseData])

    const chartLoading = expenseLoading || incomeLoading

    return (
        <>
            <Navbar links={[{ label: t("nav.dashboard") }]} />
            <Layout>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h1 className="text-xl font-bold">{t("dash.title")}</h1>
                        <DateRangePicker
                            startDate={dates.start}
                            endDate={dates.end}
                            onStartChange={(d) =>
                                setDates((p) => ({ ...p, start: d }))
                            }
                            onEndChange={(d) =>
                                setDates((p) => ({ ...p, end: d }))
                            }
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <SummaryCard
                            label={`${t("entity.income")} · UZS`}
                            value={totals.incomeUZS}
                            kind="income"
                        />
                        <SummaryCard
                            label={`${t("entity.income")} · USD`}
                            value={totals.incomeUSD}
                            kind="income"
                        />
                        <SummaryCard
                            label={`${t("entity.expense")} · UZS`}
                            value={totals.expenseUZS}
                            kind="expense"
                        />
                        <SummaryCard
                            label={`${t("entity.expense")} · USD`}
                            value={totals.expenseUSD}
                            kind="expense"
                        />
                    </div>

                    {/* One chart: income (green) vs expense (red) */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Wallet className="h-4 w-4 text-indigo-500" />
                                {t("dash.incomeVsExpense")}
                            </CardTitle>
                            <div className="flex gap-1">
                                {(["UZS", "USD"] as const).map((c) => (
                                    <Button
                                        key={c}
                                        size="sm"
                                        variant={
                                            cur === c ? "default" : "outline"
                                        }
                                        className="h-7 px-3 text-xs"
                                        onClick={() => setCur(c)}
                                    >
                                        {c}
                                    </Button>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {chartLoading ?
                                <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
                                    {t("common.loading")}
                                </div>
                            : !chartData.length ?
                                <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
                                    {t("common.noData")}
                                </div>
                            :   <ResponsiveContainer width="100%" height={320}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="hsl(var(--border))"
                                        />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 10 }}
                                            tickFormatter={(v) => v.slice(5)}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 10 }}
                                            width={48}
                                            tickFormatter={compact}
                                        />
                                        <Tooltip
                                            formatter={(v: number, name) => [
                                                money(v),
                                                name === "income" ?
                                                    t("entity.income")
                                                :   t("entity.expense"),
                                            ]}
                                            labelFormatter={(l) =>
                                                `${t("table.date")}: ${l}`
                                            }
                                        />
                                        <Legend
                                            formatter={(name) =>
                                                name === "income" ?
                                                    t("entity.income")
                                                :   t("entity.expense")
                                            }
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="income"
                                            stroke={INCOME_COLOR}
                                            strokeWidth={2}
                                            dot={false}
                                            activeDot={{ r: 4 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="expense"
                                            stroke={EXPENSE_COLOR}
                                            strokeWidth={2}
                                            dot={false}
                                            activeDot={{ r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            }
                        </CardContent>
                    </Card>

                    {/* Payment by type — income vs expense per cash register */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Wallet className="h-4 w-4 text-indigo-500" />
                                {t("dash.paymentByType")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {paymentLoading ?
                                <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
                                    {t("common.loading")}
                                </div>
                            : (
                                !paymentData ||
                                Object.keys(paymentData).length === 0
                            ) ?
                                <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
                                    {t("common.noData")}
                                </div>
                            :   <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    {(["UZS", "USD"] as const).map(
                                        (currency) => {
                                            const bucket = paymentData[currency]
                                            if (!bucket) return null
                                            return (
                                                <PaymentBucketBlock
                                                    key={currency}
                                                    currency={currency}
                                                    bucket={bucket}
                                                />
                                            )
                                        },
                                    )}
                                </div>
                            }
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        </>
    )
}

function Donut({
    title,
    tint,
    data,
}: {
    title: string
    tint: string
    data: { name: string; value: number }[]
}) {
    const total = data.reduce((s, d) => s + d.value, 0)
    if (!total) return null

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="text-center">
                <span className="text-xs font-semibold" style={{ color: tint }}>
                    {title}
                </span>
                <p className="text-sm font-bold tabular-nums">{money(total)}</p>
            </div>
            <div className="h-40 w-40">
                <PieChart width={160} height={160}>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx={78}
                        cy={78}
                        innerRadius={46}
                        outerRadius={68}
                        paddingAngle={data.length > 1 ? 2 : 0}
                        strokeWidth={0}
                        isAnimationActive={false}
                    >
                        {data.map((d, i) => (
                            <Cell
                                key={d.name}
                                fill={SLICE_COLORS[i % SLICE_COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        cursor={false}
                        content={({ active, payload }) =>
                            active && payload?.length ?
                                <div className="rounded-md border bg-background px-2.5 py-1.5 text-xs shadow-md">
                                    <span className="font-medium">
                                        {payload[0].name}
                                    </span>
                                    <span className="ml-2 tabular-nums text-muted-foreground">
                                        {money(payload[0].value as number)}
                                    </span>
                                </div>
                            :   null
                        }
                    />
                </PieChart>
            </div>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                {data.map((d, i) => (
                    <span
                        key={d.name}
                        className="flex items-center gap-1.5 text-xs"
                    >
                        <span
                            className="size-2 rounded-full"
                            style={{
                                background:
                                    SLICE_COLORS[i % SLICE_COLORS.length],
                            }}
                        />
                        {d.name}
                        <span className="tabular-nums text-muted-foreground">
                            {money(d.value)}
                        </span>
                    </span>
                ))}
            </div>
        </div>
    )
}

function PaymentBucketBlock({
    currency,
    bucket,
}: {
    currency: string
    bucket: PaymentBucket
}) {
    const { t } = useTranslation()
    const expenseData = bucket.items
        .filter((i) => i.expense > 0)
        .map((i) => ({ name: i.name, value: i.expense }))
    const incomeData = bucket.items
        .filter((i) => i.income > 0)
        .map((i) => ({ name: i.name, value: i.income }))
    const hasAny = expenseData.length > 0 || incomeData.length > 0

    return (
        <div className="flex flex-col gap-3 rounded-xl border p-4">
            <span className="text-sm font-semibold">{currency}</span>

            {!hasAny ?
                <p className="py-6 text-center text-xs text-muted-foreground">
                    {t("common.noData")}
                </p>
            :   <div className="flex flex-wrap items-start justify-around gap-4">
                    <Donut
                        title={t("entity.expense")}
                        tint={EXPENSE_COLOR}
                        data={expenseData}
                    />
                    <Donut
                        title={t("entity.income")}
                        tint={INCOME_COLOR}
                        data={incomeData}
                    />
                </div>
            }
        </div>
    )
}
