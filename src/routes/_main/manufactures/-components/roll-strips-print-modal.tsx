import type { StripLabelData } from "@/components/receipt/renderStripLabel"
import { StripLabelPrinter } from "@/components/receipt/StripLabelPrinter"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { formatDecimal } from "@/lib/utils/format-number"
import { getArray } from "@/lib/utils/get-array"
import type { PaginatedResponse } from "@/types/common"
import { Printer } from "lucide-react"
import { useState } from "react"
import type { ManufactureDetail } from "../-types"
import type { ReadyStrip } from "../../ready-strips/-types"
import { RollLabelPrintButton } from "./roll-label-print-button"

/**
 * Modal listing every ready-strip (штрипс) that was cut from a specific
 * roll (Партия/Рулон → reference_number) of a manufacture. Each strip has its
 * own print button, plus a "Печать всё" button that prints them all in
 * sequence. Opened from the "Штрипсы" button of the План-факт modal.
 */
export function RollStripsPrintModal({
    open,
    onOpenChange,
    manufactureId,
    referenceNumber,
    detail,
}: {
    open: boolean
    onOpenChange: (v: boolean) => void
    manufactureId: number
    referenceNumber: string
    detail: ManufactureDetail
}) {
    const ref = (referenceNumber ?? "").trim()

    const { data, isFetching } = useGet<PaginatedResponse<ReadyStrip>>(
        API.MANUFACTURES.READY_STRIPS,
        {
            params: { page_size: 200, manufacture: manufactureId },
            deps: [manufactureId, open],
            options: { enabled: open && !!manufactureId, staleTime: 0 },
        },
    )

    const all = getArray<ReadyStrip>(data?.results)
    const strips = all.filter(
        (s) =>
            (s.roll_reference_number ?? "").trim() === ref ||
            (s.rolls ?? []).some(
                (r) => (r.reference_number ?? "").trim() === ref,
            ),
    )

    // Roll (raw item) lookup by reference_number — for label fields not present
    // on the strip itself (wagon, steel mark).
    const rawByRef = new Map(
        (detail.raw_item_details ?? []).map((r) => [
            (r.reference_number ?? "").trim(),
            r,
        ]),
    )

    const buildStripLabel = (s: ReadyStrip): StripLabelData => {
        const raw = rawByRef.get(ref)
        return {
            zadanieNo: detail.id,
            razmerShirina: s.strip_cut_width_mm,
            partiyaRulon: s.roll_reference_number ?? ref,
            vagonNo: raw?.wagon ?? undefined,
            plavka: s.roll_plank ?? undefined,
            vesShripsa: s.total_wes,
            dataRezki: new Date(s.created_at).toLocaleDateString(),
            gotovayaProduktsiya: s.product_name,
            markaStali: raw?.raw_material?.mark ?? "Ст3сп",
            tolshchina: detail.thickness,
            quantity: s.quantity,
        }
    }

    // Sequential "print all": index of the strip currently printing (null = idle).
    const [printAllIdx, setPrintAllIdx] = useState<number | null>(null)
    const isPrintingAll = printAllIdx != null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                wrapperClassname="md:w-[900px]! md:max-w-none"
                className="min-w-[680px]! max-w-full!"
            >
                <div className="flex flex-col gap-6">
                    <DialogHeader>
                        <div className="flex items-center justify-between gap-4">
                            <DialogTitle className="text-xl font-semibold">
                                Штрипсы — Партия/Рулон {ref || "—"}
                            </DialogTitle>
                            {!!strips.length && (
                                <button
                                    type="button"
                                    onClick={() => setPrintAllIdx(0)}
                                    disabled={isPrintingAll}
                                    className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-md bg-primary hover:bg-primary/90 text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-xs whitespace-nowrap"
                                    title="Печать всех этикеток подряд"
                                >
                                    <Printer className="w-4 h-4" />
                                    {isPrintingAll ?
                                        `Печать ${(printAllIdx ?? 0) + 1}/${strips.length}...`
                                    :   `Печать всё (${strips.length})`}
                                </button>
                            )}
                        </div>
                    </DialogHeader>

                    <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted/40 px-4 py-2 border-b">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Готовые штрипсы
                            </p>
                        </div>

                        {isFetching ?
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                Загрузка...
                            </div>
                        : !strips.length ?
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                Для этой партии/рулона штрипсы не найдены
                            </div>
                        :   <div className="overflow-x-auto max-h-[60vh]">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b bg-muted/40">
                                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground w-10">
                                                №
                                            </th>
                                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                                                Продукция
                                            </th>
                                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                                Ширина
                                            </th>
                                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                                Кол-во
                                            </th>
                                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                                Вес
                                            </th>
                                            <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                                Печать
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {strips.map((s, idx) => (
                                            <tr
                                                key={s.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="px-3 py-2.5 text-xs text-muted-foreground">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    <span
                                                        className="block max-w-[280px] truncate font-medium"
                                                        title={s.product_name}
                                                    >
                                                        {s.product_name}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2.5 whitespace-nowrap">
                                                    {s.strip_cut_width_mm} mm
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    {s.quantity}
                                                </td>
                                                <td className="px-3 py-2.5 whitespace-nowrap font-medium">
                                                    {formatDecimal(s.total_wes)}
                                                </td>
                                                <td className="px-3 py-2.5 text-right">
                                                    <RollLabelPrintButton
                                                        data={buildStripLabel(
                                                            s,
                                                        )}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        }
                    </div>
                </div>

                {/* Sequential printer: prints strips one after another. Keyed
                    by index so StripLabelPrinter remounts (and re-prints) for
                    each strip; onFinish advances to the next until done. */}
                {isPrintingAll && strips[printAllIdx] && (
                    <StripLabelPrinter
                        key={printAllIdx}
                        data={buildStripLabel(strips[printAllIdx])}
                        onFinish={() =>
                            setPrintAllIdx((i) => {
                                const next = (i ?? 0) + 1
                                return next < strips.length ? next : null
                            })
                        }
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}
