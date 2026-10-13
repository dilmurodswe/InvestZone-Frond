import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { formatNumber } from "@/lib/utils/format-number"
import { cn } from "@/lib/utils/shadcn"
import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { NumericFormat } from "react-number-format"
import type { ClientDemandRow } from "../-types"

/** demand id -> amount paid from this Приход ("" = nothing). */
export type AllocationMap = Record<number, string>

type Props = {
    clientId: number | null
    currency: string | null
    incomeId: number | null
    amount: number
    value: AllocationMap
    onChange: (next: AllocationMap) => void
}

const round2 = (n: number) => Math.round(n * 100) / 100

const money = (v: unknown) =>
    formatNumber(v, { decimalScale: 2, isShowZero: true })

/**
 * МойСклад's «Оплаченные документы» on an incoming payment: the client's
 * Отгрузки in the payment currency, with К оплате / Не оплачено and an
 * editable «Оплачено из этого платежа». Footer = Привязано / Не привязано.
 *
 * Ticking a row fills it with what is left of the payment (capped at its
 * Не оплачено). A new payment is spread over the oldest Отгрузки
 * automatically as the amount changes, until the user edits a row by hand.
 */
export default function IncomeAllocations({
    clientId,
    currency,
    incomeId,
    amount,
    value,
    onChange,
}: Props) {
    const { t } = useTranslation()
    const { data, isFetching } = useGet<ClientDemandRow[]>(
        API.FINANCE.INCOME.CLIENT_DEMANDS,
        {
            params: {
                client: clientId,
                currency,
                ...(incomeId ? { income: incomeId } : {}),
            },
            options: { enabled: !!clientId && !!currency, staleTime: 0 },
        },
    )
    const rows = data ?? []

    // Editing: start from what this Приход already pays (once per load).
    const seeded = useRef<string>("")
    useEffect(() => {
        const key = `${clientId}-${currency}-${incomeId}`
        if (!data || seeded.current === key) return
        seeded.current = key
        const initial: AllocationMap = {}
        for (const r of data) {
            if (Number(r.allocated) > 0) initial[r.demand] = String(r.allocated)
        }
        onChange(initial)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, clientId, currency, incomeId])

    // Hand edits stop the automatic spread; a new client/currency resets it.
    const touched = useRef(false)
    useEffect(() => {
        touched.current = false
    }, [clientId, currency])

    const allocated = rows.reduce(
        (s, r) => s + (Number(value[r.demand]) || 0),
        0,
    )
    const unallocated = amount - allocated

    // Spread the payment over the oldest unpaid Отгрузки first.
    const spread = (): AllocationMap => {
        let left = amount
        const next: AllocationMap = {}
        for (const r of rows) {
            if (left <= 0) break
            const take = Math.min(left, Number(r.unpaid))
            if (take > 0) next[r.demand] = String(round2(take))
            left -= take
        }
        return next
    }

    const distribute = () => {
        touched.current = false
        onChange(spread())
    }

    useEffect(() => {
        if (incomeId || touched.current || !data) return
        onChange(spread())
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [amount, data, incomeId])

    const setRow = (demand: number, v: string) => {
        touched.current = true
        const next = { ...value }
        if (v) next[demand] = v
        else delete next[demand]
        onChange(next)
    }

    const toggle = (r: ClientDemandRow, on: boolean) => {
        if (!on) return setRow(r.demand, "")
        const others = allocated - (Number(value[r.demand]) || 0)
        const take = Math.min(Number(r.unpaid), Math.max(amount - others, 0))
        setRow(r.demand, take > 0 ? String(round2(take)) : "")
    }

    if (!clientId) return null

    return (
        <fieldset className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("income.paidDocs")}
            </legend>
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                    {rows.length ? t("income.bindHint") : ""}
                </p>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    disabled={!rows.length || !amount}
                    onClick={distribute}
                >
                    {t("income.distribute")}
                </Button>
            </div>

            <div className="overflow-auto rounded-md border bg-background">
                <table className="w-full text-xs">
                    <thead className="bg-muted/60 text-muted-foreground">
                        <tr className="[&_th]:px-2 [&_th]:py-1.5 [&_th]:font-medium">
                            <th className="w-8" />
                            <th className="text-left">{t("income.demand")}</th>
                            <th className="text-left">{t("table.date")}</th>
                            <th className="text-right">{t("income.toPay")}</th>
                            <th className="text-right">{t("income.unpaid")}</th>
                            <th className="text-right">
                                {t("income.paidFromThis")}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => {
                            const v = value[r.demand] ?? ""
                            const over = Number(v) > Number(r.unpaid)
                            return (
                                <tr
                                    key={r.demand}
                                    className={cn(
                                        "border-t [&_td]:px-2 [&_td]:py-1",
                                        Number(v) > 0 && "bg-primary/5",
                                    )}
                                >
                                    <td>
                                        <Checkbox
                                            checked={Number(v) > 0}
                                            disabled={
                                                !amount && !(Number(v) > 0)
                                            }
                                            onCheckedChange={(on) =>
                                                toggle(r, on === true)
                                            }
                                        />
                                    </td>
                                    <td className="whitespace-nowrap font-medium">
                                        №{r.number}
                                    </td>
                                    <td className="whitespace-nowrap text-muted-foreground">
                                        {r.date}
                                    </td>
                                    <td className="whitespace-nowrap text-right tabular-nums">
                                        {money(r.total)}
                                    </td>
                                    <td className="whitespace-nowrap text-right tabular-nums">
                                        {money(r.unpaid)}
                                    </td>
                                    <td className="w-36 text-right">
                                        <NumericFormat
                                            customInput={Input}
                                            value={v}
                                            onValueChange={(x, src) => {
                                                if (src.source === "event")
                                                    setRow(r.demand, x.value)
                                            }}
                                            thousandSeparator=" "
                                            decimalScale={2}
                                            allowNegative={false}
                                            placeholder="0"
                                            className={cn(
                                                "h-8 text-right text-xs tabular-nums placeholder:text-xs md:text-xs md:placeholder:text-xs",
                                                over &&
                                                    "border-red-500 text-red-600",
                                            )}
                                        />
                                    </td>
                                </tr>
                            )
                        })}
                        {!rows.length && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-2 py-4 text-center text-muted-foreground"
                                >
                                    {isFetching ?
                                        t("common.loading")
                                    :   t("income.noUnpaid")}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-wrap justify-end gap-x-8 gap-y-1 text-sm">
                <span className="text-muted-foreground">
                    {t("income.allocated")}:{" "}
                    <b className="text-foreground tabular-nums">
                        {money(allocated)}
                    </b>
                </span>
                <span
                    className={cn(
                        "text-muted-foreground",
                        unallocated < 0 && "text-red-600",
                    )}
                >
                    {t("income.unallocated")}:{" "}
                    <b
                        className={cn(
                            "tabular-nums",
                            unallocated < 0 ? "text-red-600" : (
                                "text-foreground"
                            ),
                        )}
                    >
                        {money(unallocated)}
                    </b>
                </span>
            </div>
        </fieldset>
    )
}
