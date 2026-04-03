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
    Line,
    LineChart,
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

type StatItem = { date: string; total: number }
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

    const totalExpense = expenseData?.reduce((s, i) => s + i.total, 0) ?? 0
    const totalIncome = incomeData?.reduce((s, i) => s + i.total, 0) ?? 0

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
                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardContent className="flex items-center gap-4 pt-6">
                                <div className="p-3 rounded-xl bg-red-100">
                                    <TrendingDown className="w-5 h-5 text-red-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Total Expense
                                    </p>
                                    <p className="text-xl font-bold text-red-500">
                                        {totalExpense.toLocaleString()}
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
                                        Total Income
                                    </p>
                                    <p className="text-xl font-bold text-green-500">
                                        {totalIncome.toLocaleString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Expense chart */}
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <TrendingDown className="w-4 h-4 text-red-500" />
                                    Expenses
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {expenseLoading ?
                                <div className="h-60 flex items-center justify-center text-sm text-muted-foreground">
                                    Loading...
                                </div>
                            :   <ResponsiveContainer width="100%" height={240}>
                                    <LineChart data={expenseData ?? []}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="hsl(var(--border))"
                                        />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 11 }}
                                            tickFormatter={(v) => v.slice(5)}
                                        />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip
                                            formatter={(v: number) => [
                                                v.toLocaleString(),
                                                "Expense",
                                            ]}
                                            labelFormatter={(l) => `Date: ${l}`}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="total"
                                            stroke="#ef4444"
                                            strokeWidth={2}
                                            dot={false}
                                            activeDot={{ r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            }
                        </CardContent>
                    </Card>

                    {/* Income chart */}
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                    Income
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {incomeLoading ?
                                <div className="h-60 flex items-center justify-center text-sm text-muted-foreground">
                                    Loading...
                                </div>
                            :   <ResponsiveContainer width="100%" height={240}>
                                    <LineChart data={incomeData ?? []}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="hsl(var(--border))"
                                        />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 11 }}
                                            tickFormatter={(v) => v.slice(5)}
                                        />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip
                                            formatter={(v: number) => [
                                                v.toLocaleString(),
                                                "Income",
                                            ]}
                                            labelFormatter={(l) => `Date: ${l}`}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="total"
                                            stroke="#22c55e"
                                            strokeWidth={2}
                                            dot={false}
                                            activeDot={{ r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            }
                        </CardContent>
                    </Card>

                    {/* Payment type stats */}
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
                            :   <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {Object.entries(paymentData).map(
                                        ([currency, val]) => {
                                            const color =
                                                CURRENCY_COLORS[currency] ??
                                                DEFAULT_COLOR
                                            return (
                                                <div
                                                    key={currency}
                                                    className="border rounded-xl p-4 flex flex-col gap-3"
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
                                                            {val.total.toLocaleString()}
                                                        </span>
                                                    </div>

                                                    {/* Items */}
                                                    {val.items.length === 0 ?
                                                        <p className="text-xs text-muted-foreground">
                                                            No transactions
                                                        </p>
                                                    :   <div className="flex flex-col gap-2">
                                                            {val.items.map(
                                                                (item, i) => {
                                                                    const Icon =
                                                                        PAYMENT_ICONS[
                                                                            i %
                                                                                PAYMENT_ICONS.length
                                                                        ]
                                                                    const pct =
                                                                        (
                                                                            val.total >
                                                                            0
                                                                        ) ?
                                                                            Math.round(
                                                                                (item.value /
                                                                                    val.total) *
                                                                                    100,
                                                                            )
                                                                        :   0
                                                                    return (
                                                                        <div
                                                                            key={
                                                                                item.name
                                                                            }
                                                                            className="flex flex-col gap-1"
                                                                        >
                                                                            <div className="flex items-center justify-between text-sm">
                                                                                <div className="flex items-center gap-2">
                                                                                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                                                                                    <span>
                                                                                        {
                                                                                            item.name
                                                                                        }
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-xs text-muted-foreground">
                                                                                        {
                                                                                            pct
                                                                                        }
                                                                                        %
                                                                                    </span>
                                                                                    <span className="font-semibold">
                                                                                        {item.value.toLocaleString()}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            {/* Progress bar */}
                                                                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                                                                <div
                                                                                    className="h-full rounded-full transition-all"
                                                                                    style={{
                                                                                        width: `${pct}%`,
                                                                                        background:
                                                                                            color,
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                },
                                                            )}
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
