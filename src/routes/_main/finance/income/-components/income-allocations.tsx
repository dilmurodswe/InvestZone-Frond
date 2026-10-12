import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

const money = (v: unknown) =>
    formatNumber(v, { decimalScale: 2, isShowZero: true })

/**
 * МойСклад's «Оплаченные документы» on an incoming payment: the client's
 * Отгрузки in the payment currency, with К оплате / Не оплачено and an
 * editable «Оплачено из этого платежа». Footer = Привязано / Не привязано.
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

    const allocated = rows.reduce(
        (s, r) => s + (Number(value[r.demand]) || 0),
        0,
    )
    const unallocated = amount - allocated

    // Spread the payment over the oldest unpaid Отгрузки first.
    const distribute = () => {
        let left = amount
        const next: AllocationMap = {}
        for (const r of rows) {
            if (left <= 0) break
            const take = Math.min(left, Number(r.unpaid))
            if (take > 0) next[r.demand] = String(take)
            left -= take
        }
        onChange(next)
    }

    if (!clientId) return null

    return (
        <div className="flex flex-col gap-2 sm:col-span-2">
            <div className="flex items-center justify-between gap-2">
                <Label>{t("income.paidDocs")}</Label>
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

            <div className="overflow-auto rounded-md border">
                <table className="w-full text-xs">
                    <thead className="bg-muted/60 text-muted-foreground">
                        <tr className="[&_th]:px-2 [&_th]:py-1.5 [&_th]:font-medium">
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
                                    className="border-t [&_td]:px-2 [&_td]:py-1"
                                >
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
                                            onValueChange={(x) =>
                                                onChange({
                                                    ...value,
                                                    [r.demand]: x.value,
                                                })
                                            }
                                            thousandSeparator=" "
                                            decimalScale={2}
                                            allowNegative={false}
                                            placeholder="0"
                                            className={cn(
                                                "h-7 text-right text-xs tabular-nums",
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
                                    colSpan={5}
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

            <div className="flex flex-col items-end gap-0.5 text-sm">
                <span>
                    {t("income.allocated")}:{" "}
                    <b className="tabular-nums">{money(allocated)}</b>
                </span>
                <span className={cn(unallocated < 0 && "text-red-600")}>
                    {t("income.unallocated")}:{" "}
                    <b className="tabular-nums">{money(unallocated)}</b>
                </span>
            </div>
        </div>
    )
}
