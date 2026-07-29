import { Settings2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

export type ColumnOption = {
    /** Column id as the table knows it. */
    id: string
    label: string
    /** Дополнительное поле карточки, а не собственная колонка товара. */
    extra?: boolean
    /** Без этой колонки строку не опознать — её не дают выключить. */
    locked?: boolean
}

/**
 * «Columns» — какие колонки таблицы показывать. Колонок у товара много
 * (цены, размеры, плюс произвольные доп. поля), и каждому складу нужны свои,
 * поэтому выключается любая, кроме названия: по нему строку и находят.
 */
export function ColumnToggle({
    options,
    hidden,
    onToggle,
}: {
    options: ColumnOption[]
    hidden: Set<string>
    onToggle: (id: string) => void
}) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    if (options.length === 0) return null

    const own = options.filter((o) => !o.extra)
    const extra = options.filter((o) => o.extra)

    const renderRow = (option: ColumnOption) => (
        <label
            key={option.id}
            title={option.locked ? t("table.columnAlwaysVisible") : undefined}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm ${
                option.locked ?
                    "cursor-default opacity-60"
                :   "cursor-pointer hover:bg-muted"
            }`}
        >
            <input
                type="checkbox"
                className="rounded"
                checked={!hidden.has(option.id)}
                disabled={option.locked}
                onChange={() => onToggle(option.id)}
            />
            {option.label}
        </label>
    )

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-input bg-background text-sm hover:bg-muted transition-colors"
            >
                <Settings2 className="w-4 h-4" />
                {t("table.columns")}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 z-50 max-h-[70vh] overflow-y-auto bg-popover border rounded-xl shadow-lg p-2 min-w-[220px] flex flex-col gap-1">
                    {own.map(renderRow)}
                    {extra.length > 0 && (
                        <>
                            <p className="mt-1 border-t px-2 pt-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                {t("table.extraFields")}
                            </p>
                            {extra.map(renderRow)}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
