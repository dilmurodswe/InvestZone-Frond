import { Card, CardContent } from "@/components/ui/card"
import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { formatNumber } from "@/lib/utils/format-number"
import { cn } from "@/lib/utils/shadcn"
import { TrendingDown, TrendingUp } from "lucide-react"
import { useTranslation } from "react-i18next"
import {
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

export type TrendMetric = "sales" | "income" | "expense"
export type Granularity = "week" | "month" | "year"

type TrendAgg = {
    start: string
    end: string
    count: number
    total: number | string
}
export type TrendStats = {
    metric: TrendMetric
    granularity: Granularity
    currency: string
    today: TrendAgg
    prev_day: TrendAgg
    today_delta_pct: number
    period: TrendAgg
    prev_period: TrendAgg
    period_delta_pct: number
    series: { date: string; total: number | string }[]
}

const money = (v: unknown) =>
    formatNumber(v, { decimalScale: 0, isShowZero: true })
const compact = (v: number) => {
    const a = Math.abs(v)
    if (a >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
    if (a >= 1_000) return `${Math.round(v / 1_000)}k`
    return String(v)
}

const METRIC_COLOR: Record<TrendMetric, string> = {
    sales: "#ea580c",
    income: "#22c55e",
    expense: "#ef4444",
}

function Delta({ pct }: { pct: number }) {
    const up = pct >= 0
    const Icon = up ? TrendingUp : TrendingDown
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 text-xs font-semibold",
                up ? "text-green-600" : "text-red-600",
            )}
        >
            <Icon className="h-3.5 w-3.5" />
            {up ? "+" : ""}
            {pct}%
        </span>
    )
}

export default function TrendWidget({
    metric,
    title,
    granularity,
    currency,
}: {
    metric: TrendMetric
    title: string
    granularity: Granularity
    currency: string
}) {
    const { t } = useTranslation()
    const { data, isLoading } = useGet<TrendStats>(API.DASHBOARD.TREND_STATS, {
        params: { metric, granularity, currency },
        options: { staleTime: 0, refetchOnMount: "always" },
    })

    const periodLabel =
        granularity === "year" ? t("dash.thisYear")
        : granularity === "month" ? t("dash.thisMonth")
        : t("dash.thisWeek")
    const vsPeriod =
        granularity === "year" ? t("dash.vsPrevYear")
        : granularity === "month" ? t("dash.vsPrevMonth")
        : t("dash.vsPrevWeek")
    const unit = metric === "sales" ? t("dash.salesCount") : t("dash.docsCount")

    const chart = (data?.series ?? []).map((s) => ({
        date: s.date,
        total: Number(s.total),
    }))

    return (
        <Card className="overflow-hidden">
            <CardContent className="flex flex-col gap-3 pt-5">
                <p
                    className="text-sm font-bold uppercase tracking-wide"
                    style={{ color: METRIC_COLOR[metric] }}
                >
                    {title}
                </p>

                {isLoading || !data ?
                    <div className="h-[188px] animate-pulse rounded-md bg-muted" />
                :   <>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Block
                                label={`${t("dash.today")} · ${data.today.end}`}
                                count={data.today.count}
                                total={data.today.total}
                                currency={currency}
                                unit={unit}
                                delta={data.today_delta_pct}
                                deltaNote={t("dash.vsPrevDay")}
                            />
                            <Block
                                label={periodLabel}
                                count={data.period.count}
                                total={data.period.total}
                                currency={currency}
                                unit={unit}
                                delta={data.period_delta_pct}
                                deltaNote={vsPeriod}
                            />
                        </div>

                        <div className="h-28">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chart}>
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 9 }}
                                        tickFormatter={(v) => v.slice(5)}
                                        minTickGap={16}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 9 }}
                                        width={40}
                                        tickFormatter={compact}
                                    />
                                    <Tooltip
                                        formatter={(v: number) => [
                                            money(v),
                                            title,
                                        ]}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="total"
                                        stroke={METRIC_COLOR[metric]}
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 3 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                }
            </CardContent>
        </Card>
    )
}

function Block({
    label,
    count,
    total,
    currency,
    unit,
    delta,
    deltaNote,
}: {
    label: string
    count: number
    total: number | string
    currency: string
    unit: string
    delta: number
    deltaNote: string
}) {
    return (
        <div className="rounded-lg border p-3">
            <p className="truncate text-xs text-muted-foreground">{label}</p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <span className="text-lg font-bold tabular-nums">
                    {count}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                        {unit}
                    </span>
                </span>
                <span className="text-lg font-bold tabular-nums">
                    {money(total)}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                        {currency}
                    </span>
                </span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
                <Delta pct={delta} />
                <span className="truncate text-[11px] text-muted-foreground">
                    {deltaNote}
                </span>
            </div>
        </div>
    )
}
