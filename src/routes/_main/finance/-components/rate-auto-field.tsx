import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatNumber } from "@/lib/utils/format-number"
import { cn } from "@/lib/utils/shadcn"
import { RefreshCw } from "lucide-react"
import { useEffect, useRef } from "react"
import {
    type FieldValues,
    type Path,
    type UseFormReturn,
    useController,
} from "react-hook-form"
import { useTranslation } from "react-i18next"
import { NumericFormat } from "react-number-format"
import { toast } from "sonner"
import { useUsdRateQuery } from "../-hooks/use-usd-rate"

type Props<T extends FieldValues> = {
    form: UseFormReturn<T>
    name: Path<T>
    /** When set, the same fetched rate is also written into this field. */
    mirrorName?: Path<T>
    /** Pre-fill from the live rate only when creating a new record. */
    autoFill: boolean
}

/**
 * USD -> UZS rate input that pre-fills itself from the live market rate when a
 * new Kirim/Chiqim is opened and stays editable. A "refresh" button pulls a
 * fresh rate on demand (also useful when editing an old record) and, when
 * `mirrorName` is given, copies the rate into that field too.
 */
export default function RateAutoField<T extends FieldValues>({
    form,
    name,
    mirrorName,
    autoFill,
}: Props<T>) {
    const { t } = useTranslation()
    const { usdRate, isLoading, refreshRate, isRefreshing } = useUsdRateQuery()
    const {
        field,
        fieldState: { isDirty },
    } = useController({ control: form.control, name })
    // Always called (RHF allows the same field twice); only used when mirroring.
    const {
        field: mirror,
        fieldState: { isDirty: mirrorDirty },
    } = useController({ control: form.control, name: mirrorName ?? name })

    // Fill once: when the live value first arrives and nothing was typed yet.
    const filled = useRef(false)
    useEffect(() => {
        if (!autoFill || filled.current || isDirty) return
        if (usdRate?.rate && !field.value) {
            const next = String(usdRate.rate)
            field.onChange(next)
            if (mirrorName && !mirrorDirty && !mirror.value) {
                mirror.onChange(next)
            }
            filled.current = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoFill, isDirty, usdRate?.rate])

    const onRefresh = async () => {
        try {
            const fresh = await refreshRate()
            if (fresh?.rate) {
                const next = String(fresh.rate)
                field.onChange(next)
                // Explicit action: overwrite the mirror even if it was edited.
                if (mirrorName) mirror.onChange(next)
                toast.success(
                    t("finCat.rateUpdated", {
                        rate: formatNumber(fresh.rate, { decimalScale: 2 }),
                    }),
                )
            }
        } catch {
            toast.error(t("finCat.rateFailed"))
        }
    }

    const sourceLabel =
        usdRate?.source === "system" ?
            t("finCat.rateSourceSystem")
        :   usdRate?.source

    return (
        <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
                <Label>{t("table.currentRate")}</Label>
                <button
                    type="button"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
                >
                    <RefreshCw
                        className={cn("size-3", isRefreshing && "animate-spin")}
                    />
                    {t("finCat.refreshRate")}
                </button>
            </div>

            <NumericFormat
                customInput={Input}
                value={field.value ?? ""}
                getInputRef={field.ref}
                onBlur={field.onBlur}
                onValueChange={(v) => field.onChange(v.value)}
                thousandSeparator=" "
                decimalScale={2}
                allowNegative={false}
                placeholder="0"
            />

            <span
                className="truncate text-xs text-muted-foreground"
                title={
                    usdRate ?
                        `${sourceLabel}${usdRate.stale ? ` · ${t("finCat.rateStale")}` : ""}`
                    :   undefined
                }
            >
                {isLoading ?
                    t("common.loading")
                : usdRate ?
                    t("finCat.marketRateHint", {
                        rate: formatNumber(usdRate.rate, { decimalScale: 2 }),
                    }) + (usdRate.stale ? ` · ${t("finCat.rateStale")}` : "")
                :   t("finCat.rateUnavailable")}
            </span>
        </div>
    )
}
