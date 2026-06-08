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
import { Check, Pencil, Trash2, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { useManufactureStore } from "../-hooks/use-manufacture-store"
import type { ManufactureDetail } from "../-types"

type RawItemRow = {
    id: number
    serverId?: number
    raw_item_detail_id: number | undefined
    plank: string
    reference_number: string
    netto: number
    cart_weight: string
}

type Production = {
    id: number
    manufacture: number
    user: {
        id: number
        full_name: string
    } | null
    master: string
    smena: string
    comment: string
    raw_items: {
        id: number
        raw_item_detail_id?: number
        raw_item_detail: number
        plank: string
        reference_number: string
        netto: string
        cart_weight: string
        waste: string
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

let rowIdCounter = 100

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
                step="0.001"
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
        primary: "bg-blue-500/10 border-blue-500/30 text-blue-700",
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

export default function ManufacturePlanFactModal() {
    return (
        <Modal
            modalKey="manufacture-plan-fact"
            title={null}
            wrapperClassname="md:w-[1150px]! md:max-w-none"
            className="min-w-[820px]! max-w-full!"
        >
            <ManufacturePlanFactContent />
        </Modal>
    )
}

function ManufacturePlanFactContent() {
    const { manufacture } = useManufactureStore()
    const { closeModal } = useModal("manufacture-plan-fact")
    const { invalidateByExactMatch } = useRevalidate()
    const { post, put, remove, isPending } = useRequest()

    const { data: detail, isLoading: detailLoading } =
        useGet<ManufactureDetail>(
            API.MANUFACTURES.ID.replace("{id}", String(manufacture?.id ?? "")),
            {
                deps: [manufacture?.id],
                options: { enabled: !!manufacture?.id, staleTime: 0 },
            },
        )

    const {
        data: productions,
        isLoading: prodLoading,
        refetch: refetchProd,
    } = useGet<Production[]>(`manufactures/${manufacture?.id}/productions`, {
        deps: [manufacture?.id],
        options: { enabled: !!manufacture?.id, staleTime: 0 },
    })

    const { data: me } = useGet<MeResponse>(API.AUTH.ME.INDEX)

    const existing = productions?.[0] ?? null

    const [editMode, setEditMode] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState(false)

    const [smena, setSmena] = useState("")
    const [comment, setComment] = useState("")
    const [rawItems, setRawItems] = useState<RawItemRow[]>([])

    const editModeRef = useRef(false)
    useEffect(() => {
        editModeRef.current = editMode
    }, [editMode])

    useEffect(() => {
        if (detail && !editMode && !existing) {
            const items = detail.raw_item_details?.map((raw) => ({
                id: rowIdCounter++,
                raw_item_detail_id: raw.id,
                plank: raw.plank || "—",
                reference_number: raw.reference_number || "—",
                netto: raw.netto || 0,
                cart_weight: "",
            }))
            if (items?.length) {
                setRawItems(items)
            }
        }
        // eslint-disable-next-line
    }, [detail, editMode])

    useEffect(() => {
        if (existing) {
            setSmena(existing.smena)
            setComment(existing.comment || "")
            setRawItems(
                existing.raw_items.map((r) => ({
                    id: rowIdCounter++,
                    serverId: r.id,
                    raw_item_detail_id:
                        r.raw_item_detail || r.raw_item_detail_id,
                    plank: r.plank,
                    reference_number: r.reference_number,
                    netto: parseFloat(r.netto),
                    cart_weight: r.cart_weight,
                })),
            )
        }
    }, [existing])

    const productNames = useMemo(() => {
        const names = detail?.detail_items
            ?.map((i) => i.product?.outer_dimension)
            .filter(Boolean)
        return names?.length ? names.join(", ") : "—"
    }, [detail])

    const updateCartWeight = (id: number, value: string) =>
        setRawItems((prev) =>
            prev.map((r) => (r.id === id ? { ...r, cart_weight: value } : r)),
        )

    const calculateWaste = (netto: number, cartWeight: string): string => {
        const cw = parseNum(cartWeight)
        if (!cw) return "0.000"
        const waste = netto - cw
        return fmt3(waste)
    }

    const masterName = me ? `${me.first_name} ${me.last_name}`.trim() : ""

    const buildPayload = () => {
        const filtered = rawItems.filter(
            (r) =>
                r.cart_weight &&
                r.cart_weight.trim() !== "" &&
                r.raw_item_detail_id,
        )

        const mapped = filtered.map((r) => ({
            raw_item_detail_id: r.raw_item_detail_id!,
            plank: r.plank,
            reference_number: r.reference_number,
            netto: r.netto,
            cart_weight: parseNum(r.cart_weight),
        }))

        return {
            manufacture: manufacture!.id,
            user_id: me?.id,
            master: masterName,
            smena,
            comment,
            raw_items: mapped,
        }
    }

    const canSubmit = !!manufacture?.id && !!smena && !!me?.id

    const handleCreate = () => {
        if (!canSubmit) return
        post("manufacture-productions", buildPayload(), {
            onSuccess: () => {
                invalidateByExactMatch([API.MANUFACTURES.INDEX])
                refetchProd()
                toast.success("План-факт успешно сохранён")
                closeModal()
            },
            onError: (err: unknown) => {
                const error = err as { message?: string }
                toast.error(
                    error?.message || "Ошибка при сохранении план-факта",
                )
            },
        })
    }

    const handleUpdate = () => {
        if (!canSubmit || !existing) return
        put(`manufacture-productions/${existing.id}`, buildPayload(), {
            onSuccess: () => {
                invalidateByExactMatch([API.MANUFACTURES.INDEX])
                refetchProd()
                setEditMode(false)
                toast.success("План-факт обновлён")
            },
            onError: (err: unknown) => {
                const error = err as { message?: string }
                toast.error(error?.message || "Ошибка при обновлении")
            },
        })
    }

    const handleDelete = () => {
        if (!existing) return
        remove(`manufacture-productions/${existing.id}`, undefined, {
            onSuccess: () => {
                invalidateByExactMatch([API.MANUFACTURES.INDEX])
                refetchProd()
                setDeleteConfirm(false)
                setEditMode(false)
                toast.success("План-факт удалён")
            },
            onError: (err: unknown) => {
                const error = err as { message?: string }
                toast.error(error?.message || "Ошибка при удалении")
            },
        })
    }

    if (!manufacture) return null
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

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <CardTitle>План-факт Manufacture #{detail.id}</CardTitle>

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

            <SectionBlock title="Данные ордера">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b bg-muted/40">
                                {[
                                    "Ордер №",
                                    "Thickness",
                                    "Width",
                                    "Date",
                                    "Рулон кол-во",
                                    "Сумма нетто",
                                    "Ордер ширина",
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
                                <RoCell value={detail.id} />
                                <RoCell value={detail.thickness} />
                                <RoCell value={detail.width} />
                                <RoCell
                                    value={new Date(
                                        detail.created_at,
                                    ).toLocaleDateString()}
                                />
                                <RoCell value={detail.count_raw} />
                                <RoCell value={fmt3(detail.total_netto)} />
                                <RoCell value={productNames} />
                            </tr>
                        </tbody>
                    </table>
                </div>
            </SectionBlock>

            <SectionBlock title="Детали рулонов">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b bg-muted/40">
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground w-10">
                                    №
                                </th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    Плавка
                                </th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    Партия/Рулон
                                </th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-red-600 whitespace-nowrap">
                                    Тележка вес
                                </th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-blue-600 whitespace-nowrap">
                                    Отходы
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {isViewMode ?
                                existing.raw_items.map((item, idx) => (
                                    <tr
                                        key={item.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="px-3 py-2.5 text-xs text-muted-foreground">
                                            {idx + 1}
                                        </td>
                                        <RoCell value={item.plank} />
                                        <RoCell value={item.reference_number} />
                                        <RoCell value={item.cart_weight} />
                                        <CalcBadge value={item.waste} />
                                    </tr>
                                ))
                            :   rawItems.map((row, idx) => (
                                    <tr
                                        key={row.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="px-3 py-2 text-xs text-muted-foreground">
                                            {idx + 1}
                                        </td>
                                        <RoCell value={row.plank} />
                                        <RoCell value={row.reference_number} />
                                        <InputCell
                                            value={row.cart_weight}
                                            onChange={(v) =>
                                                updateCartWeight(row.id, v)
                                            }
                                            placeholder="0.000"
                                        />
                                        <CalcBadge
                                            value={calculateWaste(
                                                row.netto,
                                                row.cart_weight,
                                            )}
                                        />
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </SectionBlock>

            <SectionBlock title="Мастер и смена">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b bg-muted/40">
                                {["Мастер", "Смена"].map((h) => (
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
                                <td className="px-3 py-2.5 text-sm font-medium min-w-[130px]">
                                    {isViewMode ?
                                        existing.master || "—"
                                    :   masterName || "—"}
                                </td>

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
                            </tr>
                        </tbody>
                    </table>
                </div>
            </SectionBlock>

            <SectionBlock title="Комментарий для Dynamics">
                <div className="p-4">
                    {isViewMode ?
                        <p className="text-sm text-muted-foreground">
                            {existing.comment || "—"}
                        </p>
                    :   <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Введите комментарий..."
                            rows={3}
                            className="w-full border rounded-md px-3 py-2 text-sm bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                        />
                    }
                </div>
            </SectionBlock>

            {(isCreateMode || isEditMode) && (
                <div className="flex items-center justify-between">
                    {!canSubmit && (
                        <p className="text-xs text-muted-foreground">
                            Выберите смену и введите данные
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
