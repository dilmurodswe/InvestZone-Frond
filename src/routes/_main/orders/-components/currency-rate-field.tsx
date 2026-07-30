import Modal from "@/components/custom/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useModal } from "@/hooks/use-modal"
import { formatNumber } from "@/lib/utils/format-number"
import { PencilIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useWatch, type UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { NumericFormat } from "react-number-format"
import type { OrderForm, SaleCurrency } from "../-types"

const MODAL_KEY = "order-currency-rate"

type Props = {
    methods: UseFormReturn<OrderForm>
    currencyList: SaleCurrency[]
}

/** The currency everything is converted to — the one whose rate is 1. */
const baseCurrency = (list: SaleCurrency[]) =>
    list.find((c) => Number(c.current_rate) === 1)?.currency ?? "UZS"

/**
 * Document rate shown next to the currency select — `1 USD = 12 120 UZS` with a
 * pencil that opens a dialog to override the rate for this document only.
 * The override lives in `client_currency`; an empty override means "use the
 * reference rate", so the field is kept in sync with the picked currency.
 */
export default function CurrencyRateField({ methods, currencyList }: Props) {
    const { t } = useTranslation()
    const { openModal } = useModal(MODAL_KEY)

    // `useWatch` rather than `methods.watch` — a real subscription, so the
    // block re-renders the moment another currency is picked.
    const currencyId = useWatch({
        control: methods.control,
        name: "currency_id",
    })
    const rate = useWatch({ control: methods.control, name: "client_currency" })
    const selected = currencyList.find(
        (c) => Number(c.id) === Number(currencyId),
    )
    const refRate = Number(selected?.current_rate ?? 0) || null
    const base = baseCurrency(currencyList)

    // Picking another currency resets the rate; the first render keeps whatever
    // the edited order already had.
    const prevCurrency = useRef<number | null | undefined>(undefined)
    useEffect(() => {
        const changed =
            prevCurrency.current !== undefined &&
            prevCurrency.current !== currencyId
        prevCurrency.current = currencyId
        if (!selected) return
        if (changed || !methods.getValues("client_currency")) {
            methods.setValue("client_currency", refRate)
        }
    }, [currencyId, refRate, selected, methods])

    return (
        <fieldset className="flex flex-col gap-2 w-full">
            <Label>{t("table.currencyRate")}</Label>

            {selected ?
                <div className="flex h-8 items-center gap-2 text-xs">
                    <span className="truncate">
                        1 {selected.currency} ={" "}
                        {formatNumber(rate ?? refRate ?? 0, {
                            isShowZero: true,
                        })}{" "}
                        {base}
                    </span>
                    <button
                        type="button"
                        onClick={openModal}
                        className="text-primary shrink-0 p-1 rounded hover:bg-muted"
                        title={t("common.changeRate")}
                    >
                        <PencilIcon className="w-4 h-4" />
                    </button>
                </div>
            :   <div className="flex h-8 items-center text-xs text-muted-foreground">
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
                        rate={rate}
                        onApply={(value) =>
                            methods.setValue("client_currency", value)
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
    rate: number | null
    onApply: (value: number | null) => void
}

function RateForm({ code, base, refRate, rate, onApply }: RateFormProps) {
    const { t } = useTranslation()
    const { closeModal } = useModal(MODAL_KEY)
    const isCustom = rate != null && rate !== refRate
    const [mode, setMode] = useState<"reference" | "custom">(
        isCustom ? "custom" : "reference",
    )
    const [draft, setDraft] = useState<number | null>(rate ?? refRate)

    const apply = () => {
        onApply(mode === "reference" ? refRate : draft)
        closeModal()
    }

    // Диалог набран тем же мелким кеглем, что и сама карточка заказа: рядом с
    // полями в 12 px крупный шрифт окна курса выглядел из другого приложения.
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
