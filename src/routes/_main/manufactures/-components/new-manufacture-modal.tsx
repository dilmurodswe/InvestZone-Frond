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
import { useGet } from "@/hooks/react-query/use-get"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import {
    useCategoriesSelectQuery,
    useProductsSelectQuery,
    useRawItemDetailsSelectQuery,
    useSubCategoriesSelectQuery,
    useThicknessesQuery,
    useWidthsQuery,
} from "../-hooks/use-select-queries"

export default function NewManufactureModal() {
    return (
        <Modal
            modalKey="new-manufacture"
            title={null}
            wrapperClassname="md:w-[1200px]! md:max-w-none"
            className="min-w-[860px]! max-w-full!"
        >
            <NewManufactureForm />
        </Modal>
    )
}

// ─── Types ────────────────────────────────────────────────────────────────────
type CalculateResult = {
    product_id: number
    product_name: string
    category_type: string
    amount: number
}

type CalculateResponse = {
    thickness: number
    width: number
    results: CalculateResult[]
}

type ProductRow = CalculateResult & {
    input1: string
    input2: string
    weightFromCut: number | null
}

// ─── Calculate Results Component ─────────────────────────────────────────────
function CalculateResults({
    data,
    onSubmit,
    isPending,
    selectedRawIds,
}: {
    data: CalculateResponse
    onSubmit: (rows: ProductRow[]) => void
    isPending: boolean
    selectedRawIds: number[]
}) {
    const [rows, setRows] = useState<ProductRow[]>(
        data.results.map((r) => ({
            ...r,
            input1: "",
            input2: "",
            weightFromCut: null,
        })),
    )

    // data.results o'zgarganda rows ni reset qilish
    const [prevData, setPrevData] = useState(data)
    if (prevData !== data) {
        setPrevData(data)
        setRows(
            data.results.map((r) => ({
                ...r,
                input1: "",
                input2: "",
                weightFromCut: null,
            })),
        )
    }

    const { post: postWeight } = useRequest()

    const fetchWeightForRow = useCallback(
        async (index: number, currentRows: ProductRow[]) => {
            const row = currentRows[index]
            const strip = parseFloat(row.input1)
            const qty = parseFloat(row.input2)
            if (!strip || !qty) return

            postWeight(
                "manufactures/calculate-weight-from-cut",
                {
                    raw_item_detail_ids: selectedRawIds,
                    products: [
                        {
                            product_id: row.product_id,
                            strip_cut_width_mm: strip,
                            quantity_in_cut: qty,
                        },
                    ],
                },
                {
                    onSuccess: (res: {
                        results: {
                            product_id: number
                            weight_from_cut: number
                        }[]
                    }) => {
                        const found = res.results.find(
                            (r) => r.product_id === row.product_id,
                        )
                        if (found) {
                            setRows((prev) =>
                                prev.map((r, i) =>
                                    i === index ?
                                        {
                                            ...r,
                                            weightFromCut:
                                                found.weight_from_cut,
                                        }
                                    :   r,
                                ),
                            )
                        }
                    },
                },
            )
        },
        [selectedRawIds, postWeight],
    )

    const updateRow = (
        index: number,
        field: "input1" | "input2",
        value: string,
    ) => {
        setRows((prev) => {
            const next = prev.map((row, i) =>
                i === index ? { ...row, [field]: value } : row,
            )
            // Ikkala input to'liq bo'lsa fetch qilamiz
            const updated = next[index]
            const strip = parseFloat(updated.input1)
            const qty = parseFloat(updated.input2)
            if (strip > 0 && qty > 0) {
                fetchWeightForRow(index, next)
            }
            return next
        })
    }

    const totalAmountSum = rows.reduce((sum, row) => {
        const val1 = parseFloat(row.input1) || 0
        const val2 = parseFloat(row.input2) || 0
        return sum + val1 * val2
    }, 0)

    const weightFromCutSum = rows.reduce((sum, row) => {
        return sum + (row.weightFromCut ?? 0)
    }, 0)

    const fmt = (n: number) => (n % 1 === 0 ? n : n.toFixed(2))

    return (
        <div className="flex flex-col gap-4">
            {/* Thickness / Width info */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex gap-1.5 bg-muted/40 border rounded-lg px-3 py-2 items-center">
                    <span className="text-xs text-muted-foreground">
                        Thickness:
                    </span>
                    <span className="font-semibold text-sm">
                        {data.thickness}
                    </span>
                </div>
                <div className="flex gap-1.5 bg-muted/40 border rounded-lg px-3 py-2 items-center">
                    <span className="text-xs text-muted-foreground">
                        Width:
                    </span>
                    <span className="font-semibold text-sm">{data.width}</span>
                </div>
                <div className="flex gap-1.5 bg-muted/40 border rounded-lg px-3 py-2 items-center">
                    <span className="text-xs text-muted-foreground">Rows:</span>
                    <span className="font-semibold text-sm">{rows.length}</span>
                </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[320px]">
                    <table className="w-full text-sm border-collapse">
                        <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
                            <tr className="border-b">
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    #
                                </th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    Product
                                </th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    Category
                                </th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    Strip Width Theoretical
                                </th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap min-w-[120px]">
                                    Strip Cut Width (mm)
                                </th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap min-w-[120px]">
                                    Quantity in Cut
                                </th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap min-w-[120px]">
                                    Total Amount
                                </th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap min-w-[120px]">
                                    Weight from Cut
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="text-center py-8 text-sm text-muted-foreground"
                                    >
                                        No results
                                    </td>
                                </tr>
                            )}
                            {rows.map((row, index) => {
                                const val1 = parseFloat(row.input1) || 0
                                const val2 = parseFloat(row.input2) || 0
                                const multiplied = val1 * val2

                                return (
                                    <tr
                                        key={row.product_id}
                                        className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                                    >
                                        <td className="px-3 py-2 text-xs text-muted-foreground">
                                            {index + 1}
                                        </td>
                                        <td className="px-3 py-2 max-w-[200px]">
                                            <span
                                                title={row.product_name}
                                                className="block truncate font-medium"
                                            >
                                                {row.product_name}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                                            {row.category_type}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <span className="inline-flex items-center justify-center bg-muted/50 rounded px-2 py-0.5 font-mono text-xs font-semibold">
                                                {row.amount?.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                value={row.input1}
                                                onChange={(e) =>
                                                    updateRow(
                                                        index,
                                                        "input1",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full h-8 border rounded-md px-2 text-sm bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                placeholder="0"
                                                min={0}
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                value={row.input2}
                                                onChange={(e) =>
                                                    updateRow(
                                                        index,
                                                        "input2",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full h-8 border rounded-md px-2 text-sm bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                placeholder="0"
                                                min={0}
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <div
                                                className={`w-full h-8 border rounded-md px-2 text-sm flex items-center font-medium transition-colors ${multiplied > 0 ? "bg-primary/5 border-primary/20 text-foreground" : "bg-muted/30 text-muted-foreground"}`}
                                            >
                                                {fmt(multiplied)}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div
                                                className={`w-full h-8 border rounded-md px-2 text-sm flex items-center font-medium transition-colors ${
                                                    row.weightFromCut != null ?
                                                        "bg-primary/5 border-primary/20 text-foreground"
                                                    :   "bg-muted/30 text-muted-foreground"
                                                }`}
                                            >
                                                {row.weightFromCut != null ?
                                                    fmt(row.weightFromCut)
                                                :   "—"}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                        {/* Footer: yig'indilar */}
                        <tfoot className="sticky bottom-0 border-t-2 bg-muted/70 backdrop-blur-sm z-10">
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-3 py-2.5 text-xs font-semibold text-muted-foreground text-right whitespace-nowrap"
                                >
                                    Total Sum:
                                </td>
                                <td className="px-3 py-2.5">
                                    <div
                                        className={`w-full h-8 border-2 rounded-md px-2 text-sm flex items-center font-bold transition-colors ${totalAmountSum > 0 ? "border-primary/30 bg-primary/5 text-foreground" : "bg-muted/50 text-muted-foreground"}`}
                                    >
                                        {fmt(totalAmountSum)}
                                    </div>
                                </td>
                                <td className="px-3 py-2.5">
                                    <div
                                        className={`w-full h-8 border-2 rounded-md px-2 text-sm flex items-center font-bold transition-colors ${weightFromCutSum > 0 ? "border-primary/30 bg-primary/5 text-foreground" : "bg-muted/50 text-muted-foreground"}`}
                                    >
                                        {fmt(weightFromCutSum)}
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end">
                <button
                    type="button"
                    onClick={() => onSubmit(rows)}
                    disabled={isPending}
                    className="h-9 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                    {isPending ? "Creating..." : "Create"}
                </button>
            </div>
        </div>
    )
}

// ─── Main Form ────────────────────────────────────────────────────────────────
function NewManufactureForm() {
    const { closeModal } = useModal("new-manufacture")
    const { invalidateByExactMatch } = useRevalidate()
    const { post, isPending } = useRequest()

    const resultsRef = useRef<HTMLDivElement>(null)

    // Raw material filters
    const [thickness, setThickness] = useState("")
    const [width, setWidth] = useState("")
    const [localSearch, setLocalSearch] = useState("")
    const [selectedRawIds, setSelectedRawIds] = useState<number[]>([])
    const [productThickness, setProductThickness] = useState("")
    // Product filters
    const [categoryId, setCategoryId] = useState("")
    const [subCategoryId, setSubCategoryId] = useState("")
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([])

    const [calculateParams, setCalculateParams] = useState<Record<
        string,
        unknown
    > | null>(null)

    // Queries
    const { thicknessOptions } = useThicknessesQuery()
    const { widthOptions } = useWidthsQuery()

    const rawParams: Record<string, string> = {}
    if (thickness) rawParams.thickness = thickness
    if (width) rawParams.width = width

    const { rawItemDetailOptions } = useRawItemDetailsSelectQuery(
        Object.keys(rawParams).length ? rawParams : undefined,
    )

    const { categoryOptions } = useCategoriesSelectQuery()
    const { subCategoryOptions } = useSubCategoriesSelectQuery(
        categoryId ? Number(categoryId) : undefined,
    )
    const { productOptions } = useProductsSelectQuery(
        subCategoryId ? Number(subCategoryId) : undefined,
        productThickness || undefined,
    )

    const { data: calcResponse, isFetching: isCalculating } =
        useGet<CalculateResponse>(API.MANUFACTURES.CALCULATE_AMOUNT, {
            params: calculateParams ?? undefined,
            options: { enabled: !!calculateParams },
        })

    // Results chiqganda scroll
    useEffect(() => {
        if (calcResponse && resultsRef.current) {
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                })
            }, 100)
        }
    }, [calcResponse])

    const toggleRaw = (id: number) => {
        setSelectedRawIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        )
    }

    const toggleProduct = (id: number) => {
        setSelectedProductIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        )
    }

    const handleCategoryChange = (val: string) => {
        setCategoryId(val)
        setSubCategoryId("")
        setSelectedProductIds([])
    }

    const handleThicknessChange = (val: string) => {
        setThickness(val)
        setCalculateParams(null) // eski natijani tozalash
    }

    const handleWidthChange = (val: string) => {
        setWidth(val)
        setCalculateParams(null) // eski natijani tozalash
    }

    const handleNext = () => {
        const params: Record<string, unknown> = {
            product_ids: selectedProductIds,
        }
        if (thickness) params.thickness = thickness
        if (width) params.width = width
        setCalculateParams(params)
    }

    const handleSubmit = (rows: ProductRow[]) => {
        post(
            API.MANUFACTURES.INDEX,
            {
                width: Number(width),
                thickness: Number(thickness),
                status: "ready",
                raw_item_detail_ids: selectedRawIds,
                count_raw: selectedRawIds.length,
                total_netto: totalNetto,
                details: rows.map((row) => ({
                    product_id: row.product_id,
                    strip_width_theoretical: row.amount,
                    strip_cut_width_mm: parseFloat(row.input1) || 0,
                    quantity_in_cut: parseFloat(row.input2) || 0,
                    total_amount:
                        (parseFloat(row.input1) || 0) *
                        (parseFloat(row.input2) || 0),
                    weight_from_cut: row.weightFromCut ?? 0, // o'zgardi
                })),

                total_sum: rows.reduce((sum, row) => {
                    return (
                        sum +
                        (parseFloat(row.input1) || 0) *
                            (parseFloat(row.input2) || 0)
                    )
                }, 0),
                total_cut_weight: rows.reduce((sum, row) => {
                    return sum + (row.weightFromCut ?? 0) // o'zgardi
                }, 0),
            },
            {
                onSuccess: () => {
                    invalidateByExactMatch([API.MANUFACTURES.INDEX])
                    closeModal()
                    toast.success("Created successfully")
                },
            },
        )
    }

    const selectedRaws = rawItemDetailOptions.filter((r) =>
        selectedRawIds.includes(r.id),
    )
    const totalNetto = selectedRaws.reduce((sum, r) => sum + (r.netto ?? 0), 0)

    const filteredRawItems = rawItemDetailOptions.filter((r) => {
        if (!localSearch) return true
        const q = localSearch.toLowerCase()
        return (
            r.reference_number?.toLowerCase().includes(q) ||
            r.plank?.toLowerCase().includes(q) ||
            r.status?.toLowerCase().includes(q)
        )
    })

    const canNext =
        selectedRawIds.length > 0 &&
        selectedProductIds.length > 0 &&
        !!thickness &&
        !!width

    return (
        <div className="flex flex-col gap-5">
            <CardTitle>New manufacture</CardTitle>

            {/* ── Raw Material section ── */}
            <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold">Raw Materials</p>

                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Thickness
                        </label>
                        <Select
                            value={thickness}
                            onValueChange={handleThicknessChange}
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
                        <Select value={width} onValueChange={handleWidthChange}>
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
                                {selectedRawIds.length}
                            </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">
                                Total Netto
                            </span>
                            <span className="font-semibold">
                                {totalNetto.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="ml-auto">
                        <LocalFilterInput onChange={setLocalSearch} />
                    </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-y-auto max-h-[240px]">
                        <table className="w-full text-sm border-collapse">
                            <thead className="sticky top-0 bg-muted/60 backdrop-blur-sm z-10">
                                <tr className="border-b">
                                    <th className="w-10 px-3 py-2.5" />
                                    {[
                                        "Contract #",
                                        "Status",
                                        "Brutto",
                                        "Netto",
                                        "Inner",
                                        "Outer",
                                        "Plank",
                                        "Wagon",
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
                                {filteredRawItems.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="text-center py-8 text-sm text-muted-foreground"
                                        >
                                            No data
                                        </td>
                                    </tr>
                                )}
                                {filteredRawItems.map((r) => {
                                    const checked = selectedRawIds.includes(
                                        r.id,
                                    )
                                    return (
                                        <tr
                                            key={r.id}
                                            className={`border-b last:border-0 cursor-pointer transition-colors hover:bg-muted/40 ${checked ? "bg-primary/5" : ""}`}
                                            onClick={() => toggleRaw(r.id)}
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
                                                {r.reference_number ?? "—"}
                                            </td>
                                            <td className="px-3 py-2">
                                                {r.status ?? "—"}
                                            </td>
                                            <td className="px-3 py-2">
                                                {r.brutto ?? "—"}
                                            </td>
                                            <td className="px-3 py-2">
                                                {r.netto ?? "—"}
                                            </td>
                                            <td className="px-3 py-2">
                                                {r.inner_size ?? "—"}
                                            </td>
                                            <td className="px-3 py-2">
                                                {r.outer_size ?? "—"}
                                            </td>
                                            <td className="px-3 py-2">
                                                {r.plank ?? "—"}
                                            </td>
                                            <td className="px-3 py-2">
                                                {r.wagon ?? "—"}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Product section ── */}
            <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold">Products</p>

                <div className="flex items-end gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Category
                        </label>
                        <Select
                            value={categoryId}
                            onValueChange={handleCategoryChange}
                        >
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                {categoryOptions.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Sub Category
                        </label>
                        <Select
                            value={subCategoryId}
                            onValueChange={(val) => {
                                setSubCategoryId(val)
                                setSelectedProductIds([])
                            }}
                            disabled={!categoryId}
                        >
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                {subCategoryOptions.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Thickness
                        </label>
                        <Select
                            value={productThickness}
                            onValueChange={(val) => {
                                setProductThickness(val)
                                setSelectedProductIds([])
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

                    <div className="ml-auto text-sm text-muted-foreground">
                        Selected:{" "}
                        <span className="font-semibold text-foreground">
                            {selectedProductIds.length}
                        </span>
                    </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-y-auto max-h-[200px]">
                        <table className="w-full text-sm border-collapse">
                            <thead className="sticky top-0 bg-muted/60 backdrop-blur-sm z-10">
                                <tr className="border-b">
                                    <th className="w-10 px-3 py-2.5" />
                                    {["Name", "Code", "SKU"].map((h) => (
                                        <th
                                            key={h}
                                            className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {productOptions.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="text-center py-8 text-sm text-muted-foreground"
                                        >
                                            No data
                                        </td>
                                    </tr>
                                )}
                                {productOptions.map((p) => {
                                    const checked = selectedProductIds.includes(
                                        p.id,
                                    )
                                    return (
                                        <tr
                                            key={p.id}
                                            className={`border-b last:border-0 cursor-pointer transition-colors hover:bg-muted/40 ${checked ? "bg-primary/5" : ""}`}
                                            onClick={() => toggleProduct(p.id)}
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
                                                {p.name}
                                            </td>
                                            <td className="px-3 py-2">
                                                {(
                                                    p as typeof p & {
                                                        code?: string
                                                    }
                                                ).code ?? "—"}
                                            </td>
                                            <td className="px-3 py-2">
                                                {(
                                                    p as typeof p & {
                                                        articul?: string
                                                    }
                                                ).articul ?? "—"}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Next button ── */}
            <div className="flex items-center justify-between">
                {/* Validation hint */}
                {!canNext && (
                    <p className="text-xs text-muted-foreground">
                        {!thickness || !width ?
                            "Select thickness and width to continue"
                        : !selectedRawIds.length ?
                            "Select at least one raw material"
                        :   "Select at least one product"}
                    </p>
                )}
                <div className="ml-auto flex items-center gap-2">
                    {calculateParams && (
                        <span className="text-xs text-muted-foreground">
                            {isCalculating ?
                                "Calculating..."
                            :   "Results updated ✓"}
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={!canNext || isCalculating}
                        className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                    >
                        {isCalculating ?
                            "Calculating..."
                        : calculateParams ?
                            "Recalculate →"
                        :   "Next →"}
                    </button>
                </div>
            </div>

            {/* ── Results (inline) ── */}
            {calculateParams && (
                <div ref={resultsRef} className="border-t pt-5">
                    <p className="text-sm font-semibold mb-4">Results</p>
                    {isCalculating ?
                        <div className="py-10 text-center text-sm text-muted-foreground">
                            Calculating...
                        </div>
                    : calcResponse ?
                        <CalculateResults
                            data={calcResponse}
                            onSubmit={handleSubmit}
                            isPending={isPending}
                            selectedRawIds={selectedRawIds}
                        />
                    :   null}
                </div>
            )}
        </div>
    )
}
