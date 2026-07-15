import Modal from "@/components/custom/modal"
import { CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useGet } from "@/hooks/react-query/use-get"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { round3 } from "@/lib/utils/format-number"
import { Check, Pencil, Plus, Trash2, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { useRollingPlanStore } from "../-hooks/use-rolling-plan-store"
import type { RollingPlanDetail } from "../-types"

// ─── Types ────────────────────────────────────────────────────────────────────

type Pack = {
    id: number
    serverId?: number
    weight_tn: string
    quantity_m: string
    sht_v_pachke: string
}

type Production = {
    id: number
    rolling_plan: number
    master: string
    smena: string
    status: string
    total_ton: string
    total_meters: string
    theory_kg: string
    profit_percent: string
    non_standard_tn: string
    defective_tn: string
    scrap_metal_tn: string
    waste_percent: string
    packs: {
        id: number
        pack_number: string
        weight_tn: string
        quantity: string
    }[]
    created_at: string
    updated_at: string
}

type MeResponse = {
    id: number
    first_name: string
    last_name: string
    username: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt3 = (val: number | string): string => {
    const n = Number(val)
    if (isNaN(n)) return "0.000"
    return n.toFixed(3)
}

const parseNum = (val: string): number => {
    const n = parseFloat(val)
    return isNaN(n) ? 0 : n
}

const SMENA_LABELS: Record<string, string> = { day: "День", night: "Ночь" }
const STATUS_LABELS: Record<string, string> = {
    produced: "Произведено",
    accepted: "Принято",
}

let packIdCounter = 100

// ─── Sub-components ───────────────────────────────────────────────────────────

function RoCell({ value }: { value: string | number | null | undefined }) {
    return (
        <td className="px-3 py-2.5 text-sm">
            {value != null && value !== "" ? String(value) : "—"}
        </td>
    )
}

function InputCell({
    value,
    onChange,
    placeholder,
    type = "number",
    disabled = false,
}: {
    value: string
    onChange: (v: string) => void
    placeholder?: string
    type?: string
    disabled?: boolean
}) {
    return (
        <td className="px-2 py-1.5">
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder ?? "0"}
                min={0}
                disabled={disabled}
                className="h-8 w-full min-w-[90px] border rounded-md px-2 text-sm bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
            />
        </td>
    )
}

function SelectCell({
    value,
    onChange,
    options,
    placeholder,
    disabled = false,
}: {
    value: string
    onChange: (v: string) => void
    options: { value: string; label: string }[]
    placeholder?: string
    disabled?: boolean
}) {
    return (
        <td className="px-2 py-1.5">
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger className="h-8 min-w-[120px] text-sm">
                    <SelectValue placeholder={placeholder ?? "Выбрать"} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                            {o.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </td>
    )
}

function CalcBadge({
    value,
    color = "primary",
}: {
    value: string
    color?: "primary" | "green" | "red" | "orange"
}) {
    const cls = {
        primary: "bg-primary/5 border-primary/20 text-foreground",
        green: "bg-green-500/10 border-green-500/30 text-green-700",
        red: "bg-red-500/10 border-red-500/30 text-red-700",
        orange: "bg-orange-500/10 border-orange-500/30 text-orange-700",
    }[color]
    return (
        <td className="px-3 py-2.5">
            <span
                className={`inline-flex items-center justify-center border rounded px-2 py-0.5 font-mono text-xs font-semibold min-w-[80px] ${cls}`}
            >
                {value}
            </span>
        </td>
    )
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────

export default function RollingPlanFactModal() {
    return (
        <Modal
            modalKey="rolling-plan-fact"
            title={null}
            wrapperClassname="md:w-[1150px]! md:max-w-none"
            className="min-w-[820px]! max-w-full!"
        >
            <RollingPlanFactContent />
        </Modal>
    )
}

// ─── Content ──────────────────────────────────────────────────────────────────

function RollingPlanFactContent() {
    const { rollingPlan } = useRollingPlanStore()
    const { closeModal } = useModal("rolling-plan-fact")
    const { invalidateByExactMatch } = useRevalidate()
    const { post, put, remove, isPending } = useRequest()

    // ── Remote data ───────────────────────────────────────────────────────────

    const { data: detail, isLoading: detailLoading } =
        useGet<RollingPlanDetail>(
            API.ROLLING_PLANS.ID.replace("{id}", String(rollingPlan?.id ?? "")),
            {
                deps: [rollingPlan?.id],
                options: { enabled: !!rollingPlan?.id, staleTime: 0 },
            },
        )

    const {
        data: productions,
        isLoading: prodLoading,
        refetch: refetchProd,
    } = useGet<Production[]>(`rolling-plans/${rollingPlan?.id}/productions`, {
        deps: [rollingPlan?.id],
        options: { enabled: !!rollingPlan?.id, staleTime: 0 },
    })

    const { data: me } = useGet<MeResponse>(API.AUTH.ME.INDEX)

    const existing = productions?.[0] ?? null

    // ── Form state ────────────────────────────────────────────────────────────

    const [editMode, setEditMode] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState(false)

    const [smena, setSmena] = useState("")
    const [status, setStatus] = useState("")
    const [totalMeters, setTotalMeters] = useState("")
    const [packs, setPacks] = useState<Pack[]>([
        {
            id: packIdCounter++,
            weight_tn: "",
            quantity_m: "",
            sht_v_pachke: "",
        },
    ])
    const [nonStandard, setNonStandard] = useState("")
    const [defective, setDefective] = useState("")
    const [scrapMetal, setScrapMetal] = useState("")

    const editModeRef = useRef(false)
    useEffect(() => {
        editModeRef.current = editMode
    }, [editMode])

    useEffect(() => {
        if (existing && !editMode) {
            setSmena(existing.smena)
            setStatus(existing.status)
            setTotalMeters(existing.total_meters)
            setNonStandard(existing.non_standard_tn)
            setDefective(existing.defective_tn)
            setScrapMetal(existing.scrap_metal_tn)
            setPacks(
                existing.packs.map((p) => ({
                    id: packIdCounter++,
                    serverId: p.id,
                    weight_tn: p.weight_tn,
                    quantity_m: p.quantity,
                    sht_v_pachke: "", // Backend dan kelmasa default product dan olinadi
                })),
            )
        }
        // eslint-disable-next-line
    }, [existing])

    // ── Derived values ────────────────────────────────────────────────────────

    const vesPogrMetra: number = useMemo(() => {
        const raw =
            detail?.items?.[0]?.product?.extra_fields?.["Вес 1 погонного метра"]
        return typeof raw === "number" ? raw : (
                parseFloat(String(raw ?? "0")) || 0
            )
    }, [detail])

    // Шт в Пачке from product extra_fields
    const shtVPachke: number = useMemo(() => {
        const raw = detail?.items?.[0]?.product?.extra_fields?.["Шт в Пачке"]
        return typeof raw === "number" ? raw : (
                parseFloat(String(raw ?? "0")) || 0
            )
    }, [detail])

    // pipe_length in meters (API gives mm)
    const pipeLengthM: number = useMemo(() => {
        const raw = detail?.items?.[0]?.pipe_length_mm
        return typeof raw === "number" ? raw / 1000 : 0
    }, [detail])

    // quantity per pack = Шт в Пачке * pipe_length_m (result in meters)
    const quantityPerPack: string = useMemo(() => {
        if (!shtVPachke || !pipeLengthM) return "0.000"
        return fmt3(shtVPachke * pipeLengthM)
    }, [shtVPachke, pipeLengthM])

    const totalTon: number = useMemo(
        () => packs.reduce((sum, p) => sum + parseNum(p.weight_tn), 0),
        [packs],
    )

    const teoriyaKg: number = useMemo(
        () => vesPogrMetra * parseNum(totalMeters),
        [vesPogrMetra, totalMeters],
    )

    const vigrishPercent: number = useMemo(() => {
        if (!teoriyaKg) return 0
        return totalTon / teoriyaKg - 1
    }, [totalTon, teoriyaKg])

    const wasteSum: number = useMemo(
        () =>
            parseNum(nonStandard) + parseNum(defective) + parseNum(scrapMetal),
        [nonStandard, defective, scrapMetal],
    )

    const selWeightTonNum: number = useMemo(
        () =>
            detail?.items?.reduce(
                (sum, i) => sum + (i.selected_weight_ton ?? 0),
                0,
            ) ?? 0,
        [detail],
    )
    const selWeightTon = selWeightTonNum ? fmt3(selWeightTonNum) : "—"

    const wastePercent: number = useMemo(() => {
        if (!selWeightTonNum) return 0
        return (wasteSum / selWeightTonNum) * 100
    }, [wasteSum, selWeightTonNum])

    const outerDimension = useMemo(() => {
        const dims = [
            ...new Set(
                detail?.items
                    ?.map((i) => i.product?.outer_dimension)
                    .filter(Boolean),
            ),
        ]
        return dims.length ? dims.join(", ") : "—"
    }, [detail])

    const thicknesses = useMemo(() => {
        const vals = [
            ...new Set(
                detail?.items?.map((i) => i.product?.thickness).filter(Boolean),
            ),
        ]
        return vals.length ? vals.join(", ") : "—"
    }, [detail])

    const latestPlanDate = useMemo(() => {
        const dates = (
            detail?.items?.map((i) => i.plan_date).filter(Boolean) as string[]
        )?.sort()
        const d = dates?.at(-1)
        return d ? new Date(d).toLocaleDateString() : "—"
    }, [detail])

    const latestEndDate = useMemo(() => {
        const dates = (
            detail?.items?.map((i) => i.end_date).filter(Boolean) as string[]
        )?.sort()
        const d = dates?.at(-1)
        return d ? new Date(d).toLocaleString() : "—"
    }, [detail])

    // ── Pack helpers ──────────────────────────────────────────────────────────

    const addPack = () =>
        setPacks((prev) => [
            ...prev,
            {
                id: packIdCounter++,
                weight_tn: "",
                quantity_m: quantityPerPack,
                sht_v_pachke: String(shtVPachke),
            },
        ])

    const removePack = (id: number) =>
        setPacks((prev) => prev.filter((p) => p.id !== id))

    const updatePackWeight = (id: number, value: string) =>
        setPacks((prev) =>
            prev.map((p) => (p.id === id ? { ...p, weight_tn: value } : p)),
        )

    const updatePackShtVPachke = (id: number, value: string) => {
        setPacks((prev) =>
            prev.map((p) => {
                if (p.id === id) {
                    // Agar sht_v_pachke o'zgarsa, quantity_m ni avtomatik hisoblash
                    const newSht = parseFloat(value) || 0
                    const newQuantity =
                        newSht && pipeLengthM ?
                            fmt3(newSht * pipeLengthM)
                        :   p.quantity_m
                    return {
                        ...p,
                        sht_v_pachke: value,
                        quantity_m: newQuantity,
                    }
                }
                return p
            }),
        )
    }

    // ── Submit helpers ────────────────────────────────────────────────────────

    const masterName = me ? `${me.first_name} ${me.last_name}`.trim() : ""

    const buildPayload = () => ({
        rolling_plan: rollingPlan!.id,
        master: masterName,
        smena,
        status,
        total_ton: fmt3(totalTon),
        total_meters: fmt3(parseNum(totalMeters)),
        theory_kg: fmt3(teoriyaKg),
        profit_percent: fmt3(vigrishPercent),
        non_standard_tn: fmt3(parseNum(nonStandard)),
        defective_tn: fmt3(parseNum(defective)),
        scrap_metal_tn: fmt3(parseNum(scrapMetal)),
        waste_percent: fmt3(wastePercent),
        packs: packs
            .filter((p) => p.weight_tn)
            .map((p, idx) => ({
                pack_number: `Пачка ${idx + 1}`,
                weight_tn: fmt3(parseNum(p.weight_tn)),
                quantity: p.quantity_m || quantityPerPack,
            })),
    })

    const canSubmit = !!rollingPlan?.id && !!smena && !!status

    const handleCreate = () => {
        if (!canSubmit) return
        post("rolling-productions", buildPayload(), {
            onSuccess: () => {
                invalidateByExactMatch([API.ROLLING_PLANS.INDEX])
                refetchProd()
                toast.success("Факт успешно сохранён")
                closeModal()
            },
        })
    }

    const handleUpdate = () => {
        if (!canSubmit || !existing) return
        put(`rolling-productions/${existing.id}`, buildPayload(), {
            onSuccess: () => {
                invalidateByExactMatch([API.ROLLING_PLANS.INDEX])
                refetchProd()
                setEditMode(false)
                toast.success("Факт обновлён")
            },
        })
    }

    const handleDelete = () => {
        if (!existing) return
        remove(`rolling-productions/${existing.id}`, undefined, {
            onSuccess: () => {
                invalidateByExactMatch([API.ROLLING_PLANS.INDEX])
                refetchProd()
                setDeleteConfirm(false)
                setEditMode(false)
                toast.success("Факт удалён")
            },
        })
    }

    // ── Render guards ─────────────────────────────────────────────────────────

    if (!rollingPlan) return null
    if (detailLoading || prodLoading)
        return (
            <div className="py-8 text-center text-sm text-muted-foreground">
                Загрузка...
            </div>
        )
    if (!detail) return null

    const isViewMode = !!existing && !editMode
    const isCreateMode = !existing
    const isEditMode = !!existing && editMode

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <CardTitle>План-факт #{detail.plan_number}</CardTitle>

                {existing && (
                    <div className="flex items-center gap-2">
                        {deleteConfirm ?
                            <div className="flex items-center gap-2 border border-destructive/40 rounded-lg px-3 py-1.5 bg-destructive/5">
                                <span className="text-xs text-destructive font-medium">
                                    Удалить запись?
                                </span>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isPending}
                                    className="flex items-center gap-1 text-xs font-semibold text-destructive hover:underline disabled:opacity-50"
                                >
                                    <Check className="w-3.5 h-3.5" /> Да
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeleteConfirm(false)}
                                    className="flex items-center gap-1 text-xs text-muted-foreground hover:underline"
                                >
                                    <X className="w-3.5 h-3.5" /> Нет
                                </button>
                            </div>
                        :   <>
                                {!editMode && (
                                    <button
                                        type="button"
                                        onClick={() => setEditMode(true)}
                                        className="flex items-center gap-1.5 h-8 px-3 rounded-md border text-sm hover:bg-muted transition-colors"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                        Редактировать
                                    </button>
                                )}
                                {editMode && (
                                    <button
                                        type="button"
                                        onClick={() => setEditMode(false)}
                                        className="flex items-center gap-1.5 h-8 px-3 rounded-md border text-sm hover:bg-muted transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        Отмена
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setDeleteConfirm(true)}
                                    className="flex items-center gap-1.5 h-8 px-3 rounded-md border border-destructive/40 text-destructive text-sm hover:bg-destructive/5 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Удалить
                                </button>
                            </>
                        }
                    </div>
                )}
            </div>

            {/* ── 1. Plan summary ──────────────────────────────────────────── */}
            <SectionBlock title="Данные плана">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b bg-muted/40">
                                {[
                                    "План №",
                                    "Станок",
                                    "Нар. размер",
                                    "Толщина",
                                    "Выбор (т)",
                                    "Дата плана",
                                    "Дата окончания",
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
                            <tr>
                                <RoCell value={detail.plan_number} />
                                <RoCell value={detail.machine?.name} />
                                <RoCell value={outerDimension} />
                                <RoCell value={thicknesses} />
                                <RoCell value={selWeightTon} />
                                <RoCell value={latestPlanDate} />
                                <RoCell value={latestEndDate} />
                            </tr>
                        </tbody>
                    </table>
                </div>
            </SectionBlock>

            {/* ── 2. Main fact table ───────────────────────────────────────── */}
            <SectionBlock title="Основные показатели">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b bg-muted/40">
                                {[
                                    "Мастер",
                                    "Смена",
                                    "Статус",
                                    "Общий (тн)",
                                    "Общий (м)", // ← м instead of мм
                                    "Теория (кг)",
                                    "Выгрыш (%)",
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
                            <tr className="border-b last:border-0">
                                {/* Мастер */}
                                <td className="px-3 py-2.5 text-sm font-medium min-w-[130px]">
                                    {isViewMode ?
                                        existing.master || "—"
                                    :   masterName || "—"}
                                </td>

                                {/* Смена */}
                                {isViewMode ?
                                    <RoCell
                                        value={
                                            SMENA_LABELS[existing.smena] ??
                                            existing.smena
                                        }
                                    />
                                :   <SelectCell
                                        value={smena}
                                        onChange={setSmena}
                                        options={[
                                            { value: "day", label: "День" },
                                            { value: "night", label: "Ночь" },
                                        ]}
                                        placeholder="Смена"
                                    />
                                }

                                {/* Статус */}
                                {isViewMode ?
                                    <RoCell
                                        value={
                                            STATUS_LABELS[existing.status] ??
                                            existing.status
                                        }
                                    />
                                :   <SelectCell
                                        value={status}
                                        onChange={setStatus}
                                        options={[
                                            {
                                                value: "produced",
                                                label: "Произведено",
                                            },
                                            {
                                                value: "accepted",
                                                label: "Принято",
                                            },
                                        ]}
                                        placeholder="Статус"
                                    />
                                }

                                {/* Общий (тн) - calculated */}
                                <CalcBadge
                                    value={
                                        isViewMode ?
                                            existing.total_ton
                                        :   fmt3(totalTon)
                                    }
                                />

                                {/* Общий (м) */}
                                {isViewMode ?
                                    <RoCell value={existing.total_meters} />
                                :   <InputCell
                                        value={totalMeters}
                                        onChange={setTotalMeters}
                                        placeholder="0.000"
                                    />
                                }

                                {/* Теория (кг) - calculated */}
                                <CalcBadge
                                    value={
                                        isViewMode ?
                                            existing.theory_kg
                                        :   fmt3(teoriyaKg)
                                    }
                                />

                                {/* Выгрыш (%) */}
                                {isViewMode ?
                                    <CalcBadge
                                        value={`${existing.profit_percent}%`}
                                        color={
                                            (
                                                parseNum(
                                                    existing.profit_percent,
                                                ) >= 0
                                            ) ?
                                                "green"
                                            :   "red"
                                        }
                                    />
                                :   <CalcBadge
                                        value={`${fmt3(vigrishPercent)}%`}
                                        color={
                                            vigrishPercent >= 0 ? "green" : (
                                                "red"
                                            )
                                        }
                                    />
                                }
                            </tr>
                        </tbody>
                    </table>
                </div>
            </SectionBlock>

            {/* ── 3. Packs table ───────────────────────────────────────────── */}
            <SectionBlock title="Пачки">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b bg-muted/40">
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground w-10">
                                    №
                                </th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    Пачка №
                                </th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    Вес (тн)
                                </th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    Шт в Пачке
                                </th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    Кол-во (м)
                                </th>
                                {!isViewMode && <th className="w-10" />}
                            </tr>
                        </thead>
                        <tbody>
                            {isViewMode ?
                                existing.packs.map((p, idx) => (
                                    <tr
                                        key={p.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="px-3 py-2.5 text-xs text-muted-foreground">
                                            {idx + 1}
                                        </td>
                                        <RoCell value={p.pack_number} />
                                        <RoCell value={round3(p.weight_tn)} />
                                        <RoCell value={shtVPachke || "—"} />
                                        <RoCell value={p.quantity} />
                                    </tr>
                                ))
                            :   packs.map((pack, idx) => (
                                    <tr
                                        key={pack.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="px-3 py-2 text-xs text-muted-foreground">
                                            {idx + 1}
                                        </td>
                                        {/* Пачка № — read-only, auto-generated */}
                                        <td className="px-3 py-2.5 text-sm text-muted-foreground">
                                            Пачка {idx + 1}
                                        </td>
                                        {/* Вес (тн) — manual input */}
                                        <InputCell
                                            value={pack.weight_tn}
                                            onChange={(v) =>
                                                updatePackWeight(pack.id, v)
                                            }
                                            placeholder="0.000"
                                        />
                                        {/* Шт в Пачке — editable, affects quantity_m */}
                                        <InputCell
                                            value={
                                                pack.sht_v_pachke ||
                                                String(shtVPachke)
                                            }
                                            onChange={(v) =>
                                                updatePackShtVPachke(pack.id, v)
                                            }
                                            placeholder={String(shtVPachke)}
                                        />
                                        {/* Кол-во (м) — auto calculated, read-only */}
                                        <RoCell
                                            value={
                                                pack.quantity_m ||
                                                quantityPerPack
                                            }
                                        />
                                        <td className="px-2 py-2">
                                            {packs.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removePack(pack.id)
                                                    }
                                                    className="p-1 rounded hover:bg-destructive/10 text-destructive"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>

                {!isViewMode && (
                    <div className="px-4 pb-3 pt-2">
                        <button
                            type="button"
                            onClick={addPack}
                            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                        >
                            <Plus className="w-4 h-4" /> Добавить пачку
                        </button>
                    </div>
                )}

                <div className="px-4 pb-3 flex items-center gap-2 text-sm border-t pt-3">
                    <span className="text-muted-foreground">Итого (тн):</span>
                    <span className="font-mono font-semibold">
                        {isViewMode ? existing.total_ton : fmt3(totalTon)}
                    </span>
                </div>
            </SectionBlock>

            {/* ── 4. Waste table ───────────────────────────────────────────── */}
            <SectionBlock title="Отходы">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b bg-muted/40">
                                {[
                                    "Немерный, тн",
                                    "Некондиция, тн (брак)",
                                    "Металлом, тн (Штрипс, Стружка и металлом)",
                                    "Отходы, %",
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
                            <tr>
                                {isViewMode ?
                                    <>
                                        <RoCell
                                            value={existing.non_standard_tn}
                                        />
                                        <RoCell value={existing.defective_tn} />
                                        <RoCell
                                            value={existing.scrap_metal_tn}
                                        />
                                        <CalcBadge
                                            value={`${round3(existing.waste_percent)}%`}
                                            color="orange"
                                        />
                                    </>
                                :   <>
                                        <InputCell
                                            value={nonStandard}
                                            onChange={setNonStandard}
                                            placeholder="0.000"
                                        />
                                        <InputCell
                                            value={defective}
                                            onChange={setDefective}
                                            placeholder="0.000"
                                        />
                                        <InputCell
                                            value={scrapMetal}
                                            onChange={setScrapMetal}
                                            placeholder="0.000"
                                        />
                                        <CalcBadge
                                            value={`${fmt3(wastePercent)}%`}
                                            color="orange"
                                        />
                                    </>
                                }
                            </tr>
                        </tbody>
                    </table>
                </div>
            </SectionBlock>

            {/* ── Actions ──────────────────────────────────────────────────── */}
            {(isCreateMode || isEditMode) && (
                <div className="flex items-center justify-between">
                    {!canSubmit && (
                        <p className="text-xs text-muted-foreground">
                            {!smena ? "Выберите смену" : "Выберите статус"}
                        </p>
                    )}
                    <div className="ml-auto">
                        <button
                            type="button"
                            onClick={isEditMode ? handleUpdate : handleCreate}
                            disabled={!canSubmit || isPending}
                            className="h-9 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                        >
                            {isPending ?
                                "Сохранение..."
                            : isEditMode ?
                                "Обновить"
                            :   "Сохранить"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function SectionBlock({
    title,
    children,
}: {
    title: string
    children: React.ReactNode
}) {
    return (
        <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/40 px-4 py-2 border-b">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {title}
                </p>
            </div>
            {children}
        </div>
    )
}
