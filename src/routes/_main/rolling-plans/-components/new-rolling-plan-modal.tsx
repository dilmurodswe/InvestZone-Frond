import Modal from "@/components/custom/modal"
import LocalFilterInput from "@/components/filter/local-search-input"
import { Calendar } from "@/components/ui/calendar"
import { CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { cn } from "@/lib/utils/shadcn"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
    useMachinesQuery,
    useReadyStripsQuery,
} from "../-hooks/use-select-queries"
import type { ReadyStrip } from "../-types"
import {
    useThicknessesQuery,
    useWidthsQuery,
} from "../../manufactures/-hooks/use-select-queries"

export default function NewRollingPlanModal() {
    return (
        <Modal
            modalKey="new-rolling-plan"
            title={null}
            wrapperClassname="md:w-[1200px]! md:max-w-none"
            className="min-w-[900px]! max-w-full!"
        >
            <NewRollingPlanForm />
        </Modal>
    )
}

type SelectedStrip = ReadyStrip & {
    vibor_th: string
    end_date: Date | undefined
    pipe_length_mm: string
}

function calcKolvMetar(strip: SelectedStrip): string {
    const x = Number(strip.vibor_th) || 0
    const denom = strip.strip_cut_width_mm * strip.quantity * 0.00785
    if (!denom) return "0"
    const result = x / denom
    return result % 1 === 0 ? String(result) : result.toFixed(3)
}

// Inline date picker cell using Calendar + Popover
function DatePickerCell({
    value,
    onChange,
}: {
    value: Date | undefined
    onChange: (date: Date | undefined) => void
}) {
    const [open, setOpen] = useState(false)
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "h-8 min-w-[130px] w-full border rounded-md px-2 text-sm bg-background flex items-center gap-2 text-left",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                        !value && "text-muted-foreground",
                    )}
                >
                    <CalendarIcon className="size-3.5 shrink-0" />
                    {value ? format(value, "dd.MM.yyyy") : "Sanani tanlang"}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={(date) => {
                        onChange(date)
                        setOpen(false)
                    }}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}

function NewRollingPlanForm() {
    const { closeModal } = useModal("new-rolling-plan")
    const { invalidateByExactMatch } = useRevalidate()
    const { post, isPending } = useRequest()

    const [machineId, setMachineId] = useState("")
    const [planNumber, setPlanNumber] = useState("")
    const [thickness, setThickness] = useState("")
    const [width, setWidth] = useState("")
    const [localSearch, setLocalSearch] = useState("")
    const [selectedStrips, setSelectedStrips] = useState<SelectedStrip[]>([])

    const { machineOptions } = useMachinesQuery()
    const { thicknessOptions } = useThicknessesQuery()
    const { widthOptions } = useWidthsQuery()

    const stripParams: Record<string, string> = {}
    if (thickness) stripParams.thickness = thickness
    if (width) stripParams.width = width

    const { readyStripOptions } = useReadyStripsQuery(
        Object.keys(stripParams).length ? stripParams : undefined,
    )

    const filteredStrips = readyStripOptions.filter((s) => {
        if (!localSearch) return true
        return s.product_name?.toLowerCase().includes(localSearch.toLowerCase())
    })

    const isSelected = (strip: ReadyStrip) =>
        selectedStrips.some((s) => s.id === strip.id)

    const toggleStrip = (strip: ReadyStrip) => {
        if (isSelected(strip)) {
            setSelectedStrips((prev) => prev.filter((s) => s.id !== strip.id))
        } else {
            setSelectedStrips((prev) => [
                ...prev,
                {
                    ...strip,
                    vibor_th: "",
                    end_date: undefined,
                    pipe_length_mm: "",
                },
            ])
        }
    }

    const updateStrip = (
        id: number,
        field: "vibor_th" | "end_date" | "pipe_length_mm",
        value: string | Date | undefined,
    ) => {
        setSelectedStrips((prev) =>
            prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
        )
    }

    const hasViborError = selectedStrips.some(
        (s) => s.vibor_th !== "" && Number(s.vibor_th) > s.total_wes,
    )
    const canSubmit = !!machineId && !!planNumber && selectedStrips.length > 0

    const handleSubmit = () => {
        post(
            API.ROLLING_PLANS.INDEX,
            {
                machine: Number(machineId),
                plan_number: planNumber,
                items: selectedStrips.map((s) => ({
                    ready_strip: s.id,
                    status: "plan",
                    total_pcs: s.quantity,
                    total_weight: s.total_wes,
                    selected_weight_ton: Number(s.vibor_th) || 0,
                    plan_date:
                        s.end_date ? format(s.end_date, "yyyy-MM-dd") : null,
                    calculated_meters: Number(calcKolvMetar(s)) || 0,
                    pipe_length_mm: Number(s.pipe_length_mm) || 0,
                })),
            },
            {
                onSuccess: () => {
                    invalidateByExactMatch([API.ROLLING_PLANS.INDEX])
                    closeModal()
                    toast.success("Created successfully")
                },
            },
        )
    }

    return (
        <div className="flex flex-col gap-5">
            <CardTitle>New Rolling Plan</CardTitle>

            {/* General */}
            <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold">General</p>
                <div className="flex items-end gap-4 flex-wrap">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Machine
                        </label>
                        <Select value={machineId} onValueChange={setMachineId}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select machine" />
                            </SelectTrigger>
                            <SelectContent>
                                {machineOptions.map((m) => (
                                    <SelectItem key={m.id} value={String(m.id)}>
                                        {m.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Plan Number
                        </label>
                        <input
                            type="text"
                            value={planNumber}
                            onChange={(e) => setPlanNumber(e.target.value)}
                            placeholder="e.g. RP-2026-001"
                            className="h-9 w-[200px] border rounded-md px-3 text-sm bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                    </div>
                </div>
            </div>

            {/* Ready Strips */}
            <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold">Ready Strips</p>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Thickness
                        </label>
                        <Select value={thickness} onValueChange={setThickness}>
                            <SelectTrigger className="w-[130px]">
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                {thicknessOptions.map((t) => (
                                    <SelectItem
                                        key={t.id}
                                        value={String(t.name)}
                                    >
                                        {t.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Width
                        </label>
                        <Select value={width} onValueChange={setWidth}>
                            <SelectTrigger className="w-[130px]">
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                {widthOptions.map((w) => (
                                    <SelectItem
                                        key={w.id}
                                        value={String(w.name)}
                                    >
                                        {w.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-px h-8 bg-border mx-1" />
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">
                            Selected
                        </span>
                        <span className="text-sm font-semibold">
                            {selectedStrips.length}
                        </span>
                    </div>
                    <div className="ml-auto">
                        <LocalFilterInput onChange={setLocalSearch} />
                    </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-y-auto max-h-[220px]">
                        <table className="w-full text-sm border-collapse">
                            <thead className="sticky top-0 bg-muted/60 backdrop-blur-sm z-10">
                                <tr className="border-b">
                                    <th className="w-10 px-3 py-2.5" />
                                    {[
                                        "Product",
                                        "Strip Cut Width (mm)",
                                        "Quantity",
                                        "Total WES",
                                        "Created At",
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStrips.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="text-center py-8 text-sm text-muted-foreground"
                                        >
                                            No data
                                        </td>
                                    </tr>
                                )}
                                {filteredStrips.map((strip) => {
                                    const checked = isSelected(strip)
                                    return (
                                        <tr
                                            key={strip.id}
                                            className={`border-b last:border-0 cursor-pointer transition-colors hover:bg-muted/40 ${checked ? "bg-primary/5" : ""}`}
                                            onClick={() => toggleStrip(strip)}
                                        >
                                            <td
                                                className="px-3 py-2"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <Checkbox checked={checked} />
                                            </td>
                                            <td className="px-3 py-2 font-medium">
                                                {strip.product_name} (
                                                {strip.strip_cut_width_mm} ×{" "}
                                                {strip.quantity})
                                            </td>
                                            <td className="px-3 py-2">
                                                {strip.strip_cut_width_mm}
                                            </td>
                                            <td className="px-3 py-2">
                                                {strip.quantity}
                                            </td>
                                            <td className="px-3 py-2">
                                                {strip.total_wes}
                                            </td>
                                            <td className="px-3 py-2 text-muted-foreground">
                                                {new Date(
                                                    strip.created_at,
                                                ).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Item Details */}
            {selectedStrips.length > 0 && (
                <div className="flex flex-col gap-3">
                    <p className="text-sm font-semibold">
                        Item Details
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                            Fill in details for each selected strip
                        </span>
                    </p>
                    <div className="border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto overflow-y-auto max-h-[320px]">
                            <table className="w-full text-sm border-collapse">
                                <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
                                    <tr className="border-b">
                                        {[
                                            "#",
                                            "Mahsulot",
                                            "Miqdor",
                                            "Total WES",
                                            "Vibor TH",
                                            "Sana",
                                            "Kol-v Metar",
                                            "Dlina Truba mm",
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedStrips.map((strip, idx) => {
                                        const viborNum =
                                            Number(strip.vibor_th) || 0
                                        const isOverMax =
                                            strip.vibor_th !== "" &&
                                            viborNum > strip.total_wes

                                        return (
                                            <tr
                                                key={strip.id}
                                                className="border-b last:border-0 hover:bg-muted/20"
                                            >
                                                <td className="px-3 py-2 text-xs text-muted-foreground">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-3 py-2 max-w-[200px]">
                                                    <span
                                                        className="block truncate font-medium"
                                                        title={
                                                            strip.product_name
                                                        }
                                                    >
                                                        {strip.product_name} (
                                                        {
                                                            strip.strip_cut_width_mm
                                                        }{" "}
                                                        × {strip.quantity})
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <span className="inline-flex items-center justify-center bg-muted/50 rounded px-2 py-0.5 font-mono text-xs font-semibold">
                                                        {strip.quantity}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <span className="inline-flex items-center justify-center bg-muted/50 rounded px-2 py-0.5 font-mono text-xs font-semibold">
                                                        {strip.total_wes}
                                                    </span>
                                                </td>

                                                {/* Vibor TH */}
                                                <td className="px-3 py-2">
                                                    <div className="flex flex-col gap-0.5">
                                                        <input
                                                            type="number"
                                                            value={
                                                                strip.vibor_th
                                                            }
                                                            onChange={(e) =>
                                                                updateStrip(
                                                                    strip.id,
                                                                    "vibor_th",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            min={0}
                                                            max={
                                                                strip.total_wes
                                                            }
                                                            className={cn(
                                                                "w-full h-8 min-w-[100px] border rounded-md px-2 text-sm bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                                                                isOverMax &&
                                                                    "border-destructive focus-visible:ring-destructive",
                                                            )}
                                                            placeholder="0"
                                                        />
                                                        {isOverMax && (
                                                            <span className="text-[10px] text-destructive">
                                                                Max:{" "}
                                                                {
                                                                    strip.total_wes
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Sana */}
                                                <td className="px-3 py-2">
                                                    <DatePickerCell
                                                        value={strip.end_date}
                                                        onChange={(date) =>
                                                            updateStrip(
                                                                strip.id,
                                                                "end_date",
                                                                date,
                                                            )
                                                        }
                                                    />
                                                </td>

                                                {/* Kol-v Metar */}
                                                <td className="px-3 py-2">
                                                    <span className="inline-flex items-center justify-center bg-primary/5 border border-primary/20 rounded px-2 py-0.5 font-mono text-xs font-semibold min-w-[80px]">
                                                        {calcKolvMetar(strip)}
                                                    </span>
                                                </td>

                                                {/* Dlina Truba mm */}
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="number"
                                                        value={
                                                            strip.pipe_length_mm
                                                        }
                                                        onChange={(e) =>
                                                            updateStrip(
                                                                strip.id,
                                                                "pipe_length_mm",
                                                                e.target.value,
                                                            )
                                                        }
                                                        min={0}
                                                        className="w-full h-8 min-w-[110px] border rounded-md px-2 text-sm bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                        placeholder="0"
                                                    />
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
                {!canSubmit && (
                    <p className="text-xs text-muted-foreground">
                        {!machineId ?
                            "Select a machine"
                        : !planNumber ?
                            "Enter plan number"
                        :   "Select at least one ready strip"}
                    </p>
                )}
                <div className="ml-auto">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!canSubmit || isPending || hasViborError}
                        className="h-9 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                    >
                        {isPending ? "Creating..." : "Create"}
                    </button>
                </div>
            </div>
        </div>
    )
}
