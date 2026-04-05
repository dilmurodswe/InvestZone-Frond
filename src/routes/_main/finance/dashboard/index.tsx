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
import { createFileRoute } from "@tanstack/react-router"
import { endOfMonth, format, startOfMonth } from "date-fns"
import {
    Banknote,
    CalendarIcon,
    CreditCard,
    DollarSign,
    TrendingDown,
    TrendingUp,
    Wallet,
} from "lucide-react"
import { useState } from "react"
import {
    CartesianGrid,
    Cell,
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

type StatItem = { date: string; USD: number; UZS: number }
type PaymentTypeStats = Record<
    string,
    { total: number; items: { name: string; value: number }[] }
>

const PAYMENT_ICONS = [Banknote, CreditCard, Wallet, DollarSign]
const CURRENCY_COLORS: Record<string, string> = {
    UZS: "#6366f1",
    USD: "#22c55e",
    EUR: "#f59e0b",
    RUB: "#ef4444",
}
const DEFAULT_COLOR = "#8b5cf6"

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
    return (
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1.5 h-8"
                    >
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {startDate}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        mode="single"
                        selected={new Date(startDate)}
                        onSelect={(d) =>
                            d && onStartChange(format(d, "yyyy-MM-dd"))
                        }
                    />
                </PopoverContent>
            </Popover>
            <span className="text-muted-foreground text-xs">—</span>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1.5 h-8"
                    >
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {endDate}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        mode="single"
                        selected={new Date(endDate)}
                        onSelect={(d) =>
                            d && onEndChange(format(d, "yyyy-MM-dd"))
                        }
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}

// ─── Reusable dual chart ───────────────────────────────────────────────────
function DualCurrencyChart({
    data,
    loading,
    usdColor,
    uzsColor,
    label,
}: {
    data: StatItem[] | undefined
    loading: boolean
    usdColor: string
    uzsColor: string
    label: string
}) {
    if (loading) {
        return (
            <div className="h-60 flex items-center justify-center text-sm text-muted-foreground">
                Loading...
            </div>
        )
    }

    const makeTooltip = (currency: string) => (v: number) => [
        v.toLocaleString(),
        `${label} ${currency}`,
    ]

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* USD */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: usdColor }}
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                        USD
                    </span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={data ?? []}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                        />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10 }}
                            tickFormatter={(v) => v.slice(5)}
                        />
                        <YAxis tick={{ fontSize: 10 }} width={50} />
                        <Tooltip
                            formatter={makeTooltip("USD")}
                            labelFormatter={(l) => `Date: ${l}`}
                        />
                        <Line
                            type="monotone"
                            dataKey="USD"
                            stroke={usdColor}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* UZS */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: uzsColor }}
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                        UZS
                    </span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={data ?? []}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                        />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10 }}
                            tickFormatter={(v) => v.slice(5)}
                        />
                        <YAxis tick={{ fontSize: 10 }} width={60} />
                        <Tooltip
                            formatter={makeTooltip("UZS")}
                            labelFormatter={(l) => `Date: ${l}`}
                        />
                        <Line
                            type="monotone"
                            dataKey="UZS"
                            stroke={uzsColor}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

function RouteComponent() {
    const [dates, setDates] = useState({
        start: DEFAULT_START,
        end: DEFAULT_END,
    })

    const params = { start_date: dates.start, end_date: dates.end }

    const { data: expenseData, isLoading: expenseLoading } = useGet<StatItem[]>(
        API.DASHBOARD.EXPENSE_STATS,
        { params },
    )
    const { data: incomeData, isLoading: incomeLoading } = useGet<StatItem[]>(
        API.DASHBOARD.INCOME_STATS,
        { params },
    )
    const { data: paymentData, isLoading: paymentLoading } =
        useGet<PaymentTypeStats>(API.DASHBOARD.PAYMENT_TYPE_STATS, { params })

    const totalExpenseUSD = expenseData?.reduce((s, i) => s + i.USD, 0) ?? 0
    const totalExpenseUZS = expenseData?.reduce((s, i) => s + i.UZS, 0) ?? 0
    const totalIncomeUSD = incomeData?.reduce((s, i) => s + i.USD, 0) ?? 0
    const totalIncomeUZS = incomeData?.reduce((s, i) => s + i.UZS, 0) ?? 0

    return (
        <>
            <Navbar links={[{ label: "" }]} />
            <Layout>
                <div className="flex flex-col gap-6">
                    {/* Global date filter */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <h1 className="text-xl font-bold">Finance Dashboard</h1>
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

                    {/* Summary cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="flex items-center gap-4 pt-6">
                                <div className="p-3 rounded-xl bg-red-100">
                                    <TrendingDown className="w-5 h-5 text-red-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Expense USD
                                    </p>
                                    <p className="text-xl font-bold text-red-500">
                                        ${totalExpenseUSD.toLocaleString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center gap-4 pt-6">
                                <div className="p-3 rounded-xl bg-red-100">
                                    <TrendingDown className="w-5 h-5 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Expense UZS
                                    </p>
                                    <p className="text-xl font-bold text-red-400">
                                        {totalExpenseUZS.toLocaleString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center gap-4 pt-6">
                                <div className="p-3 rounded-xl bg-green-100">
                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Income USD
                                    </p>
                                    <p className="text-xl font-bold text-green-500">
                                        ${totalIncomeUSD.toLocaleString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center gap-4 pt-6">
                                <div className="p-3 rounded-xl bg-green-100">
                                    <TrendingUp className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Income UZS
                                    </p>
                                    <p className="text-xl font-bold text-green-400">
                                        {totalIncomeUZS.toLocaleString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Expense chart */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <TrendingDown className="w-4 h-4 text-red-500" />
                                Expenses
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DualCurrencyChart
                                data={expenseData}
                                loading={expenseLoading}
                                usdColor="#ef4444"
                                uzsColor="#f97316"
                                label="Expense"
                            />
                        </CardContent>
                    </Card>

                    {/* Income chart */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                Income
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DualCurrencyChart
                                data={incomeData}
                                loading={incomeLoading}
                                usdColor="#22c55e"
                                uzsColor="#10b981"
                                label="Income"
                            />
                        </CardContent>
                    </Card>

                    {/* Payment type stats - Using recharts PieChart */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Wallet className="w-4 h-4 text-indigo-500" />
                                Payment by Type
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {paymentLoading ?
                                <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
                                    Loading...
                                </div>
                            : (
                                !paymentData ||
                                Object.keys(paymentData).length === 0
                            ) ?
                                <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
                                    No data
                                </div>
                            :   <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    {Object.entries(paymentData).map(
                                        ([currency, val]) => {
                                            const color =
                                                CURRENCY_COLORS[currency] ??
                                                DEFAULT_COLOR

                                            if (
                                                val.items.length === 0 &&
                                                val.total === 0
                                            )
                                                return null

                                            // Prepare data for pie chart
                                            const pieData = val.items.map(
                                                (item, index) => ({
                                                    name: item.name,
                                                    value: item.value,
                                                    percentage:
                                                        val.total > 0 ?
                                                            Math.round(
                                                                (item.value /
                                                                    val.total) *
                                                                    100,
                                                            )
                                                        :   0,
                                                    icon: PAYMENT_ICONS[
                                                        index %
                                                            PAYMENT_ICONS.length
                                                    ],
                                                    color: [
                                                        "#ef4444",
                                                        "#3b82f6",
                                                        "#22c55e",
                                                        "#f59e0b",
                                                        "#8b5cf6",
                                                        "#ec4899",
                                                    ][index % 6],
                                                }),
                                            )

                                            return (
                                                <div
                                                    key={currency}
                                                    className="border rounded-xl p-4 flex flex-col gap-4"
                                                >
                                                    {/* Currency header */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="w-2.5 h-2.5 rounded-full"
                                                                style={{
                                                                    background:
                                                                        color,
                                                                }}
                                                            />
                                                            <span className="font-semibold text-sm">
                                                                {currency}
                                                            </span>
                                                        </div>
                                                        <span
                                                            className="text-sm font-bold"
                                                            style={{ color }}
                                                        >
                                                            Total:{" "}
                                                            {val.total.toLocaleString()}
                                                        </span>
                                                    </div>

                                                    {/* Pie Chart using recharts */}
                                                    {val.items.length === 0 ?
                                                        <p className="text-xs text-muted-foreground text-center py-4">
                                                            No transactions
                                                        </p>
                                                    :   <div className="flex flex-col items-center gap-4">
                                                            <ResponsiveContainer
                                                                width="100%"
                                                                height={200}
                                                            >
                                                                <PieChart>
                                                                    <Pie
                                                                        data={
                                                                            pieData
                                                                        }
                                                                        dataKey="value"
                                                                        nameKey="name"
                                                                        cx="50%"
                                                                        cy="50%"
                                                                        innerRadius={
                                                                            40
                                                                        }
                                                                        outerRadius={
                                                                            70
                                                                        }
                                                                        paddingAngle={
                                                                            2
                                                                        }
                                                                        label={({
                                                                            name,
                                                                            percent,
                                                                        }) =>
                                                                            `${name} ${(percent * 100).toFixed(0)}%`
                                                                        }
                                                                        labelLine={
                                                                            false
                                                                        }
                                                                    >
                                                                        {pieData.map(
                                                                            (
                                                                                entry,
                                                                            ) => (
                                                                                <Cell
                                                                                    key={`cell-${entry.name}`}
                                                                                    fill={
                                                                                        entry.color
                                                                                    }
                                                                                />
                                                                            ),
                                                                        )}
                                                                    </Pie>
                                                                    <Tooltip
                                                                        formatter={(
                                                                            value: number,
                                                                        ) =>
                                                                            value.toLocaleString()
                                                                        }
                                                                    />
                                                                </PieChart>
                                                            </ResponsiveContainer>

                                                            {/* Legend */}
                                                            <div className="flex flex-wrap justify-center gap-3 w-full">
                                                                {pieData.map(
                                                                    (item) => (
                                                                        <div
                                                                            key={
                                                                                item.name
                                                                            }
                                                                            className="flex items-center gap-2"
                                                                        >
                                                                            <div
                                                                                className="w-3 h-3 rounded-full"
                                                                                style={{
                                                                                    backgroundColor:
                                                                                        item.color,
                                                                                }}
                                                                            />
                                                                            <item.icon className="w-3 h-3 text-muted-foreground" />
                                                                            <span className="text-xs">
                                                                                {
                                                                                    item.name
                                                                                }
                                                                            </span>
                                                                            <span className="text-xs font-semibold">
                                                                                {
                                                                                    item.percentage
                                                                                }

                                                                                %
                                                                            </span>
                                                                            <span className="text-xs text-muted-foreground">
                                                                                (
                                                                                {item.value.toLocaleString()}

                                                                                )
                                                                            </span>
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
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
