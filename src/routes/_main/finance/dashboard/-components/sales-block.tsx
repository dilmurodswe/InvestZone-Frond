import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { cn } from "@/lib/utils/shadcn"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import { compact, money } from "./format"

export type Granularity = "week" | "month" | "year"

type TrendAgg = {
    start: string
    end: string
    count: number
    total: number | string
}
type TrendStats = {
    today: TrendAgg
    prev_day: TrendAgg
    today_delta_pct: number
    period: TrendAgg
    prev_period: TrendAgg
    period_delta_pct: number
    series: { date: string; total: number | string }[]
}

const SALES_COLOR = "#ea580c"

/**
 * МойСклад «Продажи»: Сегодня and the current week / month / year — count,
 * amount and the change vs the previous one — next to a chart of the period.
 */
export default function SalesBlock({
    granularity,
    currency,
}: {
    granularity: Granularity
    currency: string
}) {
    const { t } = useTranslation()
    const { data, isLoading } = useGet<TrendStats>(API.DASHBOARD.TREND_STATS, {
        params: { metric: "sales", granularity, currency },
        options: { staleTime: 0, refetchOnMount: "always" },
    })

    // Comma-separated in the locale files: "Пн,Вт,…" / "Янв,Фев,…".
    const weekdays = t("dash.weekdays").split(",")
    const months = t("dash.monthsShort").split(",")

    // Week → Пн…Вс, month → day numbers, year → one bar per month.
    const chart = useMemo(() => {
        const series = data?.series ?? []
        if (granularity === "year") {
            const byMonth = Array.from({ length: 12 }, (_, i) => ({
                label: months[i] ?? String(i + 1),
                total: 0,
            }))
            for (const s of series) {
                byMonth[Number(s.date.slice(5, 7)) - 1].total += Number(s.total)
            }
            return byMonth
        }
        if (granularity === "week") {
            const days = weekdays.map((label) => ({ label, total: 0 }))
            for (const s of series) {
                const wd = (new Date(s.date).getDay() + 6) % 7
                days[wd].total += Number(s.total)
            }
            return days
        }
        return series.map((s) => ({
            label: String(Number(s.date.slice(8))),
            total: Number(s.total),
        }))
    }, [data, granularity, weekdays, months])

    const periodLabel =
        granularity === "year" ? t("dash.thisYear")
        : granularity === "month" ? t("dash.thisMonth")
        : t("dash.thisWeek")
    const vsPeriod =
        granularity === "year" ? t("dash.vsPrevYear")
        : granularity === "month" ? t("dash.vsPrevMonth")
        : t("dash.vsPrevWeek")

    if (isLoading || !data) {
        return <div className="h-56 animate-pulse rounded-lg bg-muted" />
    }

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-5">
                <StatRow
                    label={`${t("dash.today")} · ${data.today.end}`}
                    count={data.today.count}
                    total={data.today.total}
                    diff={
                        Number(data.today.total) - Number(data.prev_day.total)
                    }
                    pct={data.today_delta_pct}
                    note={t("dash.vsPrevDayShort")}
                    currency={currency}
                />
                <StatRow
                    label={periodLabel}
                    count={data.period.count}
                    total={data.period.total}
                    diff={
                        Number(data.period.total) -
                        Number(data.prev_period.total)
                    }
                    pct={data.period_delta_pct}
                    note={vsPeriod}
                    currency={currency}
                />
            </div>

            <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chart}
                        margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                            className="stroke-border"
                        />
                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tick={{ fontSize: 11 }}
                            width={48}
                            tickFormatter={compact}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            cursor={{ className: "fill-muted" }}
                            content={({ active, payload, label }) =>
                                active && payload?.length ?
                                    <div className="rounded-md border bg-background px-2.5 py-1.5 text-xs shadow-md">
                                        <span className="text-muted-foreground">
                                            {label}
                                        </span>
                                        <span className="ml-2 font-semibold tabular-nums">
                                            {money(payload[0].value, currency)}{" "}
                                            {currency}
                                        </span>
                                    </div>
                                :   null
                            }
                        />
                        <Bar
                            dataKey="total"
                            fill={SALES_COLOR}
                            radius={[3, 3, 0, 0]}
                            maxBarSize={36}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

function StatRow({
    label,
    count,
    total,
    diff,
    pct,
    note,
    currency,
}: {
    label: string
    count: number
    total: number | string
    diff: number
    pct: number
    note: string
    currency: string
}) {
    const { t } = useTranslation()
    const up = diff >= 0
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="flex flex-wrap items-end gap-x-8 gap-y-2">
                <Figure
                    value={String(count)}
                    caption={t("dash.salesCount")}
                    className="text-primary"
                />
                <Figure value={money(total, currency)} caption={currency} />
                <div className="flex flex-col">
                    <span
                        className={cn(
                            "text-base font-semibold tabular-nums",
                            diff === 0 ? "text-foreground"
                            : up ? "text-green-600"
                            : "text-red-600",
                        )}
                    >
                        {up && diff > 0 ? "+" : ""}
                        {money(diff, currency)}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                            {currency} ({up ? "+" : ""}
                            {pct}%)
                        </span>
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                        {note}
                    </span>
                </div>
            </div>
        </div>
    )
}

export function Figure({
    value,
    caption,
    className,
}: {
    value: string
    caption: string
    className?: string
}) {
    return (
        <div className="flex min-w-0 flex-col items-center">
            <span
                className={cn(
                    "max-w-full truncate text-2xl font-semibold tabular-nums",
                    className,
                )}
                title={value}
            >
                {value}
            </span>
            <span className="text-[11px] text-muted-foreground">{caption}</span>
        </div>
    )
}
