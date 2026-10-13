import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { cn } from "@/lib/utils/shadcn"
import type { MutualSettlementsResponse } from "@/routes/_main/clients/-types"
import { Link, createFileRoute } from "@tanstack/react-router"
import { format } from "date-fns"
import { ArrowRight, Check } from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"
import { useTranslation } from "react-i18next"
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import { useReferenceRates } from "../-hooks/use-reference-rates"
import { compact, money } from "./-components/format"
import SalesBlock, { Figure, type Granularity } from "./-components/sales-block"

export const Route = createFileRoute("/_main/finance/dashboard/")({
    component: RouteComponent,
})

const INCOME_COLOR = "#22c55e"
const EXPENSE_COLOR = "#ef4444"
const BALANCE_COLOR = "#3b82f6"

const CURRENCIES = ["UZS", "USD", "RUB"] as const
type Currency = (typeof CURRENCIES)[number]

type KassaBalance = {
    payment_type: number
    name: string
} & Partial<Record<Currency, string>>

type DebtBlock = {
    currency: string
    count: number
    total: string | number
    rows: {
        id: number
        number: string
        client: string | null
        amount: string | number
        days: number
    }[]
}

type MoneyChart = {
    currency: string
    months: {
        month: string
        income: string | number
        expense: string | number
        balance: string | number
    }[]
}

type DocType = "income" | "expense" | "order" | "demand"
type RecentDoc = {
    type: DocType
    id: number
    number: string
    date: string
    client: string | null
    amount: string | number
    currency: string
    applicable: boolean
    updated_at: string
}

const DOC_LINK: Record<DocType, string> = {
    income: "/finance/income",
    expense: "/finance/expence",
    order: "/orders",
    demand: "/demands",
}

// The picked currency is a per-viewer preference — remember it.
const CUR_KEY = "dashboard-currency"
const readCurrency = (): Currency => {
    try {
        const v = localStorage.getItem(CUR_KEY)
        return (CURRENCIES as readonly string[]).includes(v ?? "") ?
                (v as Currency)
            :   "UZS"
    } catch {
        return "UZS"
    }
}

const fresh = { staleTime: 0, refetchOnMount: "always" as const }

/* ------------------------------------------------------------------ */
/* Building blocks                                                     */
/* ------------------------------------------------------------------ */

function Panel({
    title,
    action,
    className,
    children,
}: {
    title: ReactNode
    action?: ReactNode
    className?: string
    children: ReactNode
}) {
    return (
        <section
            className={cn(
                "flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground shadow-sm sm:p-5",
                className,
            )}
        >
            <header className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-primary">
                    {title}
                </h2>
                {action}
            </header>
            {children}
        </section>
    )
}

function Segmented<T extends string>({
    value,
    options,
    onChange,
}: {
    value: T
    options: readonly (readonly [T, string])[]
    onChange: (v: T) => void
}) {
    return (
        <div className="inline-flex rounded-lg bg-muted p-0.5">
            {options.map(([v, label]) => (
                <button
                    key={v}
                    type="button"
                    onClick={() => onChange(v)}
                    className={cn(
                        "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                        value === v ?
                            "bg-background text-foreground shadow-sm"
                        :   "text-muted-foreground hover:text-foreground",
                    )}
                >
                    {label}
                </button>
            ))}
        </div>
    )
}

function Skeleton({ className }: { className?: string }) {
    return (
        <div className={cn("animate-pulse rounded-lg bg-muted", className)} />
    )
}

function ViewAll({ to }: { to: string }) {
    const { t } = useTranslation()
    return (
        <Link
            to={to}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
            {t("dash.viewAll")}
            <ArrowRight className="h-3 w-3" />
        </Link>
    )
}

function HeadRow({ children }: { children: ReactNode }) {
    return (
        <tr className="border-b-2 border-primary/40 text-left text-xs [&_th]:pr-3 [&_th]:pb-1.5 [&_th]:font-semibold [&_th:last-child]:pr-0">
            {children}
        </tr>
    )
}

function EmptyRow({ span, text }: { span: number; text: string }) {
    return (
        <tr>
            <td
                colSpan={span}
                className="py-6 text-center text-muted-foreground"
            >
                {text}
            </td>
        </tr>
    )
}

const BODY_ROW =
    "border-b last:border-0 [&_td]:py-2 [&_td]:pr-3 [&_td:last-child]:pr-0"

/* ------------------------------------------------------------------ */
/* Page — same order as МойСклад «Показатели»                          */
/* ------------------------------------------------------------------ */

function RouteComponent() {
    const { t } = useTranslation()
    const [cur, setCurState] = useState<Currency>(readCurrency)
    const [granularity, setGranularity] = useState<Granularity>("week")

    const setCur = (c: Currency) => {
        setCurState(c)
        try {
            localStorage.setItem(CUR_KEY, c)
        } catch {
            /* storage unavailable — the choice just isn't remembered */
        }
    }

    return (
        <>
            <Navbar links={[{ label: t("nav.dashboard") }]} />
            <Layout>
                <div className="flex flex-col gap-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h1 className="text-xl font-bold">{t("dash.title")}</h1>
                        <Segmented
                            value={cur}
                            options={CURRENCIES.map((c) => [c, c] as const)}
                            onChange={setCur}
                        />
                    </div>

                    <Panel
                        title={t("dash.sales")}
                        action={
                            <Segmented
                                value={granularity}
                                options={[
                                    ["week", t("dash.week")],
                                    ["month", t("dash.month")],
                                    ["year", t("dash.year")],
                                ]}
                                onChange={setGranularity}
                            />
                        }
                    >
                        <SalesBlock granularity={granularity} currency={cur} />
                    </Panel>

                    <div className="grid gap-5 lg:grid-cols-2">
                        <DebtPanel
                            title={t("dash.overdueOrders")}
                            endpoint={API.DASHBOARD.OVERDUE_ORDERS}
                            countLabel={t("dash.ordersCount")}
                            docLabel={t("dash.order")}
                            link="/orders"
                            currency={cur}
                        />
                        <DebtPanel
                            title={t("dash.unpaidDemands")}
                            endpoint={API.DASHBOARD.UNPAID_DEMANDS}
                            countLabel={t("dash.demandsCount")}
                            docLabel={t("dash.demand")}
                            link="/demands"
                            currency={cur}
                        />
                    </div>

                    <MoneyPanel currency={cur} />

                    <MutualPanel currency={cur} />

                    <RecentDocsPanel currency={cur} />
                </div>
            </Layout>
        </>
    )
}

/* ------------------------------------------------------------------ */
/* Просроченные заказы / Неоплаченные отгрузки                         */
/* ------------------------------------------------------------------ */

function DebtPanel({
    title,
    endpoint,
    countLabel,
    docLabel,
    link,
    currency,
}: {
    title: string
    endpoint: string
    countLabel: string
    docLabel: string
    link: string
    currency: Currency
}) {
    const { t } = useTranslation()
    const { data, isLoading } = useGet<DebtBlock>(endpoint, {
        params: { currency },
        options: fresh,
    })
    const block = data ?? { count: 0, total: 0, rows: [] }

    return (
        <Panel title={title} action={<ViewAll to={link} />}>
            {isLoading ?
                <Skeleton className="h-40" />
            :   <>
                    <div className="flex gap-10">
                        <Figure
                            value={String(block.count)}
                            caption={countLabel}
                            className="text-primary"
                        />
                        <Figure
                            value={money(block.total, currency)}
                            caption={currency}
                        />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <HeadRow>
                                    <th>{t("dash.counterparty")}</th>
                                    <th>{docLabel}</th>
                                    <th className="text-right">
                                        {t("dash.sum")}
                                        <span className="block text-[10px] font-normal text-muted-foreground">
                                            {currency}
                                        </span>
                                    </th>
                                    <th className="text-right">
                                        {t("dash.term")}
                                        <span className="block text-[10px] font-normal text-muted-foreground">
                                            {t("dash.days")}
                                        </span>
                                    </th>
                                </HeadRow>
                            </thead>
                            <tbody>
                                {block.rows.map((r) => (
                                    <tr key={r.id} className={BODY_ROW}>
                                        <td className="max-w-40 truncate">
                                            {r.client ?? "—"}
                                        </td>
                                        <td className="whitespace-nowrap">
                                            №{r.number}
                                        </td>
                                        <td className="whitespace-nowrap text-right tabular-nums">
                                            {money(r.amount, currency)}
                                        </td>
                                        <td
                                            className={cn(
                                                "text-right tabular-nums",
                                                r.days > 30 &&
                                                    "font-semibold text-red-600",
                                            )}
                                        >
                                            {r.days}
                                        </td>
                                    </tr>
                                ))}
                                {!block.rows.length && (
                                    <EmptyRow
                                        span={4}
                                        text={t("dash.noOverdue")}
                                    />
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            }
        </Panel>
    )
}

/* ------------------------------------------------------------------ */
/* Деньги — kassa balances + monthly Приход / Расход / Остаток         */
/* ------------------------------------------------------------------ */

function MoneyPanel({ currency }: { currency: Currency }) {
    const { t } = useTranslation()
    const months = t("dash.monthsShort").split(",")
    const { data: kassa, isLoading: kassaLoading } = useGet<KassaBalance[]>(
        API.DASHBOARD.KASSA_BALANCES,
        { params: { currency }, options: fresh },
    )
    const { data: chart, isLoading: chartLoading } = useGet<MoneyChart>(
        API.DASHBOARD.MONEY_CHART,
        { params: { currency, months: 6 }, options: fresh },
    )

    const rows = (kassa ?? []).map((r) => ({
        id: r.payment_type,
        name: r.name,
        value: Number(r[currency] ?? 0),
    }))
    const total = rows.reduce((s, r) => s + r.value, 0)

    const series = (chart?.months ?? []).map((m) => ({
        label: months[Number(m.month.slice(5, 7)) - 1] ?? m.month,
        income: Number(m.income),
        expense: Number(m.expense),
        balance: Number(m.balance),
    }))

    const seriesName = (key: string) =>
        key === "income" ? t("entity.income")
        : key === "expense" ? t("entity.expense")
        : t("dash.balance")

    return (
        <Panel title={t("dash.money")}>
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-4">
                    {kassaLoading ?
                        <Skeleton className="h-40" />
                    :   <>
                            <div className="self-start">
                                <Figure
                                    value={money(total, currency)}
                                    caption={currency}
                                    className={cn(total < 0 && "text-red-600")}
                                />
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <HeadRow>
                                        <th>{t("dash.kassa")}</th>
                                        <th className="text-right">
                                            {t("dash.balance")}
                                        </th>
                                    </HeadRow>
                                </thead>
                                <tbody>
                                    {rows.map((r) => (
                                        <tr key={r.id} className={BODY_ROW}>
                                            <td className="truncate">
                                                {r.name}
                                            </td>
                                            <td
                                                className={cn(
                                                    "text-right tabular-nums",
                                                    r.value < 0 &&
                                                        "text-red-600",
                                                )}
                                            >
                                                {money(r.value, currency)}
                                            </td>
                                        </tr>
                                    ))}
                                    {!rows.length && (
                                        <EmptyRow
                                            span={2}
                                            text={t("common.noData")}
                                        />
                                    )}
                                </tbody>
                            </table>
                        </>
                    }
                </div>

                <div className="flex min-w-0 flex-col gap-2">
                    {chartLoading ?
                        <Skeleton className="h-64" />
                    :   <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart
                                    data={series}
                                    margin={{
                                        top: 8,
                                        right: 0,
                                        left: 0,
                                        bottom: 0,
                                    }}
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
                                    />
                                    <YAxis
                                        yAxisId="flow"
                                        tick={{ fontSize: 11 }}
                                        width={48}
                                        tickFormatter={compact}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        yAxisId="balance"
                                        orientation="right"
                                        tick={{ fontSize: 11 }}
                                        width={48}
                                        tickFormatter={compact}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ className: "fill-muted" }}
                                        content={({
                                            active,
                                            payload,
                                            label,
                                        }) =>
                                            active && payload?.length ?
                                                <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-md">
                                                    <p className="mb-1 font-medium">
                                                        {label}
                                                    </p>
                                                    {payload.map((p) => (
                                                        <p
                                                            key={String(
                                                                p.dataKey,
                                                            )}
                                                            className="flex items-center justify-between gap-4"
                                                        >
                                                            <LegendDot
                                                                color={String(
                                                                    p.color,
                                                                )}
                                                                label={seriesName(
                                                                    String(
                                                                        p.dataKey,
                                                                    ),
                                                                )}
                                                            />
                                                            <span className="font-semibold tabular-nums">
                                                                {money(
                                                                    p.value,
                                                                    currency,
                                                                )}{" "}
                                                                {currency}
                                                            </span>
                                                        </p>
                                                    ))}
                                                </div>
                                            :   null
                                        }
                                    />
                                    <Bar
                                        yAxisId="flow"
                                        dataKey="income"
                                        fill={INCOME_COLOR}
                                        fillOpacity={0.8}
                                        radius={[3, 3, 0, 0]}
                                        maxBarSize={22}
                                    />
                                    <Bar
                                        yAxisId="flow"
                                        dataKey="expense"
                                        fill={EXPENSE_COLOR}
                                        fillOpacity={0.8}
                                        radius={[3, 3, 0, 0]}
                                        maxBarSize={22}
                                    />
                                    <Line
                                        yAxisId="balance"
                                        type="monotone"
                                        dataKey="balance"
                                        stroke={BALANCE_COLOR}
                                        strokeWidth={2}
                                        dot={{ r: 2.5 }}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    }
                    <div className="flex justify-center gap-4 text-xs">
                        <LegendDot
                            color={INCOME_COLOR}
                            label={t("entity.income")}
                        />
                        <LegendDot
                            color={EXPENSE_COLOR}
                            label={t("entity.expense")}
                        />
                        <LegendDot
                            color={BALANCE_COLOR}
                            label={t("dash.balance")}
                        />
                    </div>
                </div>
            </div>
        </Panel>
    )
}

function LegendDot({ color, label }: { color: string; label: string }) {
    return (
        <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
                className="size-2 rounded-full"
                style={{ background: color }}
            />
            {label}
        </span>
    )
}

/* ------------------------------------------------------------------ */
/* Взаиморасчёты                                                       */
/* ------------------------------------------------------------------ */

function MutualPanel({ currency }: { currency: Currency }) {
    const { t } = useTranslation()
    const { data } = useGet<MutualSettlementsResponse>(
        API.SALE.MUTUAL_SETTLEMENTS,
        { options: fresh },
    )
    const { convert } = useReferenceRates()

    const mutual = useMemo(() => {
        // A client can owe in several currencies — sum them all, converted
        // into the picked one at the reference rate.
        const rows = (data?.results ?? [])
            .map((r) => ({
                id: r.client_id,
                name: r.client_name,
                closing: CURRENCIES.reduce(
                    (sum, c) =>
                        sum + convert(Number(r.closing[c] ?? 0), c, currency),
                    0,
                ),
            }))
            .filter((r) => Math.round(r.closing))
        let owedToUs = 0
        let weOwe = 0
        for (const r of rows) {
            if (r.closing < 0) owedToUs += -r.closing
            else weOwe += r.closing
        }
        const top = [...rows]
            .sort((a, b) => Math.abs(b.closing) - Math.abs(a.closing))
            .slice(0, 6)
        return { owedToUs, weOwe, top }
    }, [data, currency, convert])

    return (
        <Panel
            title={t("dash.mutualSettlements")}
            action={<ViewAll to="/clients/mutual-settlements" />}
        >
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="flex flex-wrap gap-10">
                    <Figure
                        value={money(mutual.owedToUs, currency)}
                        caption={`${t("mutual.totalOwedToUs")}, ${currency}`}
                        className="text-red-600"
                    />
                    <Figure
                        value={money(mutual.weOwe, currency)}
                        caption={`${t("mutual.totalWeOwe")}, ${currency}`}
                        className="text-green-600"
                    />
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <HeadRow>
                            <th>{t("dash.counterparty")}</th>
                            <th className="text-right">
                                {t("dash.balance")}, {currency}
                            </th>
                        </HeadRow>
                    </thead>
                    <tbody>
                        {mutual.top.map((r) => (
                            <tr key={r.id} className={BODY_ROW}>
                                <td className="truncate">{r.name}</td>
                                <td
                                    className={cn(
                                        "text-right font-medium tabular-nums",
                                        r.closing < 0 ?
                                            "text-red-600"
                                        :   "text-green-600",
                                    )}
                                >
                                    {money(r.closing, currency)}
                                </td>
                            </tr>
                        ))}
                        {!mutual.top.length && (
                            <EmptyRow span={2} text={t("common.noData")} />
                        )}
                    </tbody>
                </table>
            </div>
        </Panel>
    )
}

/* ------------------------------------------------------------------ */
/* Недавние документы                                                  */
/* ------------------------------------------------------------------ */

function RecentDocsPanel({ currency }: { currency: Currency }) {
    const { t } = useTranslation()
    const { data, isLoading } = useGet<RecentDoc[]>(
        API.DASHBOARD.RECENT_DOCUMENTS,
        { params: { currency }, options: fresh },
    )
    const docType: Record<DocType, string> = {
        income: t("dash.docType.income"),
        expense: t("dash.docType.expense"),
        order: t("dash.docType.order"),
        demand: t("dash.docType.demand"),
    }

    return (
        <Panel title={t("dash.recentDocs")}>
            {isLoading ?
                <Skeleton className="h-48" />
            :   <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-sm">
                        <thead>
                            <HeadRow>
                                <th>{t("dash.document")}</th>
                                <th className="text-center">
                                    {t("dash.posted")}
                                </th>
                                <th>{t("dash.docDate")}</th>
                                <th>{t("dash.counterparty")}</th>
                                <th className="text-right">
                                    {t("dash.sum")}, {currency}
                                </th>
                                <th className="text-right">
                                    {t("dash.changed")}
                                </th>
                            </HeadRow>
                        </thead>
                        <tbody>
                            {(data ?? []).map((d) => (
                                <tr
                                    key={`${d.type}-${d.id}`}
                                    className={BODY_ROW}
                                >
                                    <td className="whitespace-nowrap">
                                        <Link
                                            to={DOC_LINK[d.type]}
                                            className="text-primary hover:underline"
                                        >
                                            {d.number.replace(/^№/, "")}{" "}
                                            {docType[d.type]}
                                        </Link>
                                    </td>
                                    <td className="text-center">
                                        {d.applicable && (
                                            <Check className="inline h-4 w-4 text-green-600" />
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap tabular-nums">
                                        {d.date}
                                    </td>
                                    <td className="max-w-48 truncate">
                                        {d.client ?? "—"}
                                    </td>
                                    <td className="whitespace-nowrap text-right tabular-nums">
                                        {money(d.amount, currency)}
                                    </td>
                                    <td className="whitespace-nowrap text-right text-muted-foreground tabular-nums">
                                        {format(
                                            new Date(d.updated_at),
                                            "dd.MM.yyyy HH:mm",
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {!data?.length && (
                                <EmptyRow span={6} text={t("common.noData")} />
                            )}
                        </tbody>
                    </table>
                </div>
            }
        </Panel>
    )
}
