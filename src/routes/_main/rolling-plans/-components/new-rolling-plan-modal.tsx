import Modal from "@/components/custom/modal"
import LocalFilterInput from "@/components/filter/local-search-input"
import { CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
    total_pcs: string
    total_weight: string
    selected_weight_ton: string
    end_date: string
    calculated_meters: string
    pipe_length_mm: string
}

function NewRollingPlanForm() {
    const { closeModal } = useModal("new-rolling-plan")
    const { invalidateByExactMatch } = useRevalidate()
    const { post, isPending } = useRequest()

    // General fields
    const [machineId, setMachineId] = useState("")
    const [planNumber, setPlanNumber] = useState("")

    // Ready strips filters
    const [thickness, setThickness] = useState("")
    const [width, setWidth] = useState("")
    const [localSearch, setLocalSearch] = useState("")

    // Selected strips with their input values
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
        const q = localSearch.toLowerCase()
        return s.product_name?.toLowerCase().includes(q)
    })

    const isSelected = (strip: ReadyStrip) =>
        selectedStrips.some((s) => s.product_id === strip.product_id)

    const toggleStrip = (strip: ReadyStrip) => {
        if (isSelected(strip)) {
            setSelectedStrips((prev) =>
                prev.filter((s) => s.product_id !== strip.product_id),
            )
        } else {
            setSelectedStrips((prev) => [
                ...prev,
                {
                    ...strip,
                    total_pcs: "",
                    total_weight: "",
                    selected_weight_ton: "",
                    end_date: "",
                    calculated_meters: "",
                    pipe_length_mm: "",
                },
            ])
        }
    }

    const updateStrip = (
        productId: number,
        field: keyof Omit<SelectedStrip, keyof ReadyStrip>,
        value: string,
    ) => {
        setSelectedStrips((prev) =>
            prev.map((s) =>
                s.product_id === productId ? { ...s, [field]: value } : s,
            ),
        )
    }

    const canSubmit = !!machineId && !!planNumber && selectedStrips.length > 0

    const handleSubmit = () => {
        post(
            API.ROLLING_PLANS.INDEX,
            {
                machine: Number(machineId),
                plan_number: planNumber,
                items: selectedStrips.map((s) => ({
                    ready_strip: s.product_id,
                    status: "on_warehouse",
                    total_pcs: Number(s.total_pcs) || 0,
                    total_weight: Number(s.total_weight) || 0,
                    selected_weight_ton: Number(s.selected_weight_ton) || 0,
                    end_date: s.end_date || null,
                    calculated_meters: Number(s.calculated_meters) || 0,
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

    const fmt = (n: number) => (n % 1 === 0 ? n : n.toFixed(2))

    return (
        <div className="flex flex-col gap-5">
            <CardTitle>New Rolling Plan</CardTitle>

            {/* ── General Info ── */}
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

            {/* ── Ready Strips Section ── */}
            <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold">Ready Strips</p>

                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Thickness
                        </label>
                        <Select
                            value={thickness}
                            onValueChange={(val) => {
                                setThickness(val)
                            }}
                        >
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
                        <Select
                            value={width}
                            onValueChange={(val) => {
                                setWidth(val)
                            }}
                        >
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

                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">
                                Selected
                            </span>
                            <span className="font-semibold">
                                {selectedStrips.length}
                            </span>
                        </div>
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
                                            colSpan={5}
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
                                            key={strip.product_id}
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
                                                {strip.product_name}
                                            </td>
                                            <td className="px-3 py-2">
                                                {strip.strip_cut_width_mm}
                                            </td>
                                            <td className="px-3 py-2">
                                                {strip.quantity}
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

            {/* ── Selected Strips Input Table ── */}
            {selectedStrips.length > 0 && (
                <div className="flex flex-col gap-3">
                    <p className="text-sm font-semibold">
                        Item Details
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                            Fill in details for each selected strip
                        </span>
                    </p>

                    <div className="border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto overflow-y-auto max-h-[300px]">
                            <table className="w-full text-sm border-collapse">
                                <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
                                    <tr className="border-b">
                                        {[
                                            "#",
                                            "Product",
                                            "Strip Cut Width",
                                            "Total Pcs",
                                            "Total Weight",
                                            "Selected Weight (ton)",
                                            "End Date",
                                            "Calculated Meters",
                                            "Pipe Length (mm)",
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
                                    {selectedStrips.map((strip, idx) => (
                                        <tr
                                            key={strip.product_id}
                                            className="border-b last:border-0 hover:bg-muted/20"
                                        >
                                            <td className="px-3 py-2 text-xs text-muted-foreground">
                                                {idx + 1}
                                            </td>
                                            <td className="px-3 py-2 max-w-[180px]">
                                                <span
                                                    className="block truncate font-medium"
                                                    title={strip.product_name}
                                                >
                                                    {strip.product_name}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className="inline-flex items-center justify-center bg-muted/50 rounded px-2 py-0.5 font-mono text-xs font-semibold">
                                                    {strip.strip_cut_width_mm}
                                                </span>
                                            </td>
                                            {(
                                                [
                                                    ["total_pcs", "number"],
                                                    ["total_weight", "number"],
                                                    [
                                                        "selected_weight_ton",
                                                        "number",
                                                    ],
                                                    ["end_date", "date"],
                                                    [
                                                        "calculated_meters",
                                                        "number",
                                                    ],
                                                    [
                                                        "pipe_length_mm",
                                                        "number",
                                                    ],
                                                ] as const
                                            ).map(([field, type]) => (
                                                <td
                                                    key={field}
                                                    className="px-3 py-2"
                                                >
                                                    <input
                                                        type={type}
                                                        value={strip[field]}
                                                        onChange={(e) =>
                                                            updateStrip(
                                                                strip.product_id,
                                                                field,
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full h-8 min-w-[110px] border rounded-md px-2 text-sm bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                        placeholder={
                                                            type === "date" ?
                                                                "YYYY-MM-DD"
                                                            :   "0"
                                                        }
                                                        min={
                                                            type === "number" ?
                                                                0
                                                            :   undefined
                                                        }
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="sticky bottom-0 border-t-2 bg-muted/70 backdrop-blur-sm z-10">
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="px-3 py-2.5 text-xs font-semibold text-muted-foreground text-right"
                                        >
                                            Total:
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <div className="w-full h-8 border-2 rounded-md px-2 text-sm flex items-center font-bold bg-primary/5 border-primary/20">
                                                {fmt(
                                                    selectedStrips.reduce(
                                                        (s, r) =>
                                                            s +
                                                            (Number(
                                                                r.total_pcs,
                                                            ) || 0),
                                                        0,
                                                    ),
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <div className="w-full h-8 border-2 rounded-md px-2 text-sm flex items-center font-bold bg-primary/5 border-primary/20">
                                                {fmt(
                                                    selectedStrips.reduce(
                                                        (s, r) =>
                                                            s +
                                                            (Number(
                                                                r.total_weight,
                                                            ) || 0),
                                                        0,
                                                    ),
                                                )}
                                            </div>
                                        </td>
                                        <td colSpan={4} />
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Actions ── */}
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
                        disabled={!canSubmit || isPending}
                        className="h-9 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                    >
                        {isPending ? "Creating..." : "Create"}
                    </button>
                </div>
            </div>
        </div>
    )
}
