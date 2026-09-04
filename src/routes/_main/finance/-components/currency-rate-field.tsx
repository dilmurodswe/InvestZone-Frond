import Modal from "@/components/custom/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useModal } from "@/hooks/use-modal"
import { formatNumber } from "@/lib/utils/format-number"
import { PencilIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import {
    type FieldValues,
    type Path,
    type UseFormReturn,
    useController,
    useWatch,
} from "react-hook-form"
import { useTranslation } from "react-i18next"
import { NumericFormat } from "react-number-format"

const MODAL_KEY = "finance-currency-rate"

export type RateCurrency = {
    id: number
    currency: string
    current_rate: number | string
}

type Props<T extends FieldValues> = {
    form: UseFormReturn<T>
    /** Currency-id field on the form. */
    currencyName: Path<T>
    /** Reference-rate field — kept in sync with the picked currency. */
    currentRateName: Path<T>
    /** Editable per-document rate; defaults to the reference rate. */
    customRateName: Path<T>
    currencyList: RateCurrency[]
    /** Pre-fill the rate only when creating a new record. */
    autoFill: boolean
}

/** The currency everything is converted to — the one whose rate is 1. */
const baseCurrency = (list: RateCurrency[]) =>
    list.find((c) => Number(c.current_rate) === 1)?.currency ?? "UZS"

/**
 * Document rate shown next to the currency select — `1 USD = 12 500 UZS` with a
 * pencil that opens a dialog to override the rate for this record only. Picking
 * a currency writes its reference rate into both `current_rate` and
 * `custom_rate`; the dialog only touches `custom_rate`.
 */
export default function CurrencyRateField<T extends FieldValues>({
    form,
    currencyName,
    currentRateName,
    customRateName,
    currencyList,
    autoFill,
}: Props<T>) {
    const { t } = useTranslation()
    const { openModal } = useModal(MODAL_KEY)

    // `useWatch` rather than `form.watch` — a real subscription, so the block
    // re-renders the moment another currency is picked.
    const currencyId = useWatch({ control: form.control, name: currencyName })
    const { field: currentRate } = useController({
        control: form.control,
        name: currentRateName,
    })
    const { field: customRate } = useController({
        control: form.control,
        name: customRateName,
    })

    const selected = currencyList.find(
        (c) => Number(c.id) === Number(currencyId),
    )
    const refRate = Number(selected?.current_rate ?? 0) || null
    const base = baseCurrency(currencyList)
    const override =
        customRate.value === "" || customRate.value == null ?
            null
        :   Number(customRate.value)

    // Picking another currency resets the rate; the first render keeps whatever
    // an edited record already had.
    const prevCurrency = useRef<unknown>(undefined)
    useEffect(() => {
        const first = prevCurrency.current === undefined
        const changed = !first && prevCurrency.current !== currencyId
        prevCurrency.current = currencyId
        if (!selected) return
        const hasCustom = customRate.value !== "" && customRate.value != null
        if (changed || (first && autoFill && !hasCustom)) {
            const next = refRate != null ? String(refRate) : ""
            currentRate.onChange(next)
            customRate.onChange(next)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currencyId, refRate, selected])

    return (
        <fieldset className="flex min-w-0 flex-col gap-1.5">
            <Label>{t("table.currencyRate")}</Label>

            {selected ?
                <div className="flex h-9 items-center gap-2 text-sm">
                    <span className="truncate">
                        1 {selected.currency} ={" "}
                        {formatNumber(override ?? refRate ?? 0, {
                            isShowZero: true,
                        })}{" "}
                        {base}
                    </span>
                    <button
                        type="button"
                        onClick={openModal}
                        className="shrink-0 rounded p-1 text-primary hover:bg-muted"
                        title={t("common.changeRate")}
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>
                </div>
            :   <div className="flex h-9 items-center text-sm text-muted-foreground">
                    —
                </div>
            }

            <Modal
                modalKey={MODAL_KEY}
                title={
                    <span className="text-sm">
                        {t("table.docCurrencyRate")}
                    </span>
                }
            >
                {selected && (
                    <RateForm
                        code={selected.currency}
                        base={base}
                        refRate={refRate}
                        override={override}
                        onApply={(value) =>
                            customRate.onChange(
                                value != null ? String(value) : "",
                            )
                        }
                    />
                )}
            </Modal>
        </fieldset>
    )
}

type RateFormProps = {
    code: string
    base: string
    refRate: number | null
    override: number | null
    onApply: (value: number | null) => void
}

function RateForm({ code, base, refRate, override, onApply }: RateFormProps) {
    const { t } = useTranslation()
    const { closeModal } = useModal(MODAL_KEY)
    const isCustom = override != null && override !== refRate
    const [mode, setMode] = useState<"reference" | "custom">(
        isCustom ? "custom" : "reference",
    )
    const [draft, setDraft] = useState<number | null>(override ?? refRate)

    const apply = () => {
        onApply(mode === "reference" ? refRate : draft)
        closeModal()
    }

    return (
        <div className="flex flex-col gap-4 pt-1 text-xs">
            <RadioGroup
                value={mode}
                onValueChange={(value) =>
                    setMode(value as "reference" | "custom")
                }
                className="gap-3"
            >
                <label className="flex cursor-pointer items-start gap-2.5">
                    <RadioGroupItem
                        value="reference"
                        className="mt-0.5 size-3.5"
                    />
                    <span className="flex flex-col gap-0.5">
                        <span className="text-xs">
                            1 {code} ={" "}
                            {formatNumber(refRate ?? 0, { isShowZero: true })}{" "}
                            {base}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                            {t("common.rateFromReference")}
                        </span>
                    </span>
                </label>

                <label className="flex cursor-pointer items-center gap-2.5">
                    <RadioGroupItem value="custom" className="size-3.5" />
                    <span className="flex items-center gap-2 text-xs">
                        1 {code} =
                        <NumericFormat
                            customInput={Input}
                            value={draft ?? ""}
                            thousandSeparator=" "
                            allowNegative={false}
                            decimalScale={2}
                            className="h-8 w-32 text-xs"
                            onFocus={() => setMode("custom")}
                            onValueChange={(values) =>
                                setDraft(values.floatValue ?? null)
                            }
                        />
                        {base}
                    </span>
                </label>
            </RadioGroup>

            <div className="flex justify-end gap-2 [&_button]:h-8 [&_button]:text-xs">
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={closeModal}
                >
                    {t("common.cancel")}
                </Button>
                <Button type="button" size="sm" onClick={apply}>
                    {t("common.changeRate")}
                </Button>
            </div>
        </div>
    )
}
