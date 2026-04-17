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
// import { getArray } from "@/lib/utils/get-array"
import { useState } from "react"
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
            wrapperClassname="md:w-[900px]! md:max-w-none"
            className="min-w-[860px]!"
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
    input4: string
}

// ─── Calculate Results Component ─────────────────────────────────────────────
function CalculateResults({
    data,
    onBack,
    onSubmit,
    isPending,
}: {
    data: CalculateResponse
    onBack: () => void
    onSubmit: (rows: ProductRow[]) => void
    isPending: boolean
}) {
    const [rows, setRows] = useState<ProductRow[]>(
        data.results.map((r) => ({
            ...r,
            input1: "",
            input2: "",
            input4: "",
        })),
    )

    const updateRow = (
        index: number,
        field: "input1" | "input2" | "input4",
        value: string,
    ) => {
        setRows((prev) =>
            prev.map((row, i) =>
                i === index ? { ...row, [field]: value } : row,
            ),
        )
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Thickness / Width info */}
            <div className="flex items-center gap-4 text-sm">
                <div className="flex flex-col gap-0.5 bg-muted/30 rounded-lg px-3 py-2">
                    <span className="text-xs text-muted-foreground">
                        Thickness
                    </span>
                    <span className="font-semibold">{data.thickness}</span>
                </div>
                <div className="flex flex-col gap-0.5 bg-muted/30 rounded-lg px-3 py-2">
                    <span className="text-xs text-muted-foreground">Width</span>
                    <span className="font-semibold">{data.width}</span>
                </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead className="sticky top-0 bg-muted/60 backdrop-blur-sm z-10">
                            <tr className="border-b">
                                <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    Product
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    Category
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    Amount
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap min-w-[110px]">
                                    Input 1
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap min-w-[110px]">
                                    Input 2
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap min-w-[110px]">
                                    Input 3
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap min-w-[110px]">
                                    Input 4
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => {
                                const val1 = parseFloat(row.input1) || 0
                                const val2 = parseFloat(row.input2) || 0
                                const multiplied = val1 * val2

                                return (
                                    <tr
                                        key={row.product_id}
                                        className="border-b last:border-0 hover:bg-muted/20"
                                    >
                                        <td className="px-3 py-2 max-w-[220px]">
                                            <span
                                                title={row.product_name}
                                                className="block truncate"
                                            >
                                                {row.product_name}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            {row.category_type}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap font-medium">
                                            {row.amount}
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
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="w-full h-8 border rounded-md px-2 text-sm bg-muted/30 flex items-center font-medium text-muted-foreground">
                                                {multiplied % 1 === 0 ?
                                                    multiplied
                                                :   multiplied.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                value={row.input4}
                                                onChange={(e) =>
                                                    updateRow(
                                                        index,
                                                        "input4",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full h-8 border rounded-md px-2 text-sm bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                placeholder="—"
                                            />
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={onBack}
                    className="h-9 px-4 rounded-md border text-sm font-medium hover:bg-muted transition-colors"
                >
                    ← Back
                </button>
                <button
                    type="button"
                    onClick={() => onSubmit(rows)}
                    disabled={isPending}
                    className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
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

    const [step, setStep] = useState<1 | 2>(1)

    // Raw material filters
    const [thickness, setThickness] = useState("")
    const [width, setWidth] = useState("")
    const [localSearch, setLocalSearch] = useState("")
    const [selectedRawIds, setSelectedRawIds] = useState<number[]>([])

    // Product filters
    const [categoryId, setCategoryId] = useState("")
    const [subCategoryId, setSubCategoryId] = useState("")
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([])

    // Calculate params — faqat Next bosilganda o'rnatiladi
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
    )

    // Calculate GET
    const { data: calcResponse, isFetching: isCalculating } =
        useGet<CalculateResponse>(API.MANUFACTURES.CALCULATE_AMOUNT, {
            params: calculateParams ?? undefined,
            options: {
                enabled: !!calculateParams,
            },
        })

    // Handlers
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

    const handleNext = () => {
        const params: Record<string, unknown> = {
            product_ids: selectedProductIds,
        }
        if (thickness) params.thickness = thickness
        if (width) params.width = width
        setCalculateParams(params)
        setStep(2)
    }

    const handleBack = () => {
        setStep(1)
        setCalculateParams(null)
    }

    const handleSubmit = (rows: ProductRow[]) => {
        post(
            API.MANUFACTURES.INDEX,
            {
                product_ids: selectedProductIds,
                raw_item_detail_ids: selectedRawIds,
                status: "ready",
                rows, // keyingi promptda aniqlashtirramiz
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

    // Raw material stats
    const selectedRaws = rawItemDetailOptions.filter((r) =>
        selectedRawIds.includes(r.id),
    )
    const totalNetto = selectedRaws.reduce((sum, r) => sum + (r.netto ?? 0), 0)

    // Filtered raw items
    const filteredRawItems = rawItemDetailOptions.filter((r) => {
        if (!localSearch) return true
        const q = localSearch.toLowerCase()
        return (
            r.contract_number?.toLowerCase().includes(q) ||
            r.supplier?.toLowerCase().includes(q) ||
            r.raw_material_name?.toLowerCase().includes(q) ||
            r.mark?.toLowerCase().includes(q) ||
            r.plank?.toLowerCase().includes(q)
        )
    })

    const canNext = selectedRawIds.length > 0 && selectedProductIds.length > 0

    // ── Step 2 ──
    if (step === 2) {
        if (isCalculating) {
            return (
                <div className="flex flex-col gap-5">
                    <CardTitle>New manufacture</CardTitle>
                    <div className="py-12 text-center text-sm text-muted-foreground">
                        Calculating...
                    </div>
                </div>
            )
        }

        if (!calcResponse) return null

        return (
            <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <CardTitle>New manufacture</CardTitle>
                    <span className="text-xs text-muted-foreground">
                        Step 2 of 2
                    </span>
                </div>
                <CalculateResults
                    data={calcResponse}
                    onBack={handleBack}
                    onSubmit={handleSubmit}
                    isPending={isPending}
                />
            </div>
        )
    }

    // ── Step 1 ──
    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <CardTitle>New manufacture</CardTitle>
                <span className="text-xs text-muted-foreground">
                    Step 1 of 2
                </span>
            </div>

            {/* ── Raw Material section ── */}
            <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold">Raw Materials</p>

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

                    <div className="ml-auto hidden">
                        <LocalFilterInput onChange={setLocalSearch} />
                    </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-y-auto max-h-[240px]">
                        <table className="w-full text-sm border-collapse">
                            <thead className="sticky top-0 bg-muted/60 backdrop-blur-sm z-10">
                                <tr className="border-b">
                                    <th className="w-10 px-3 py-2" />
                                    {[
                                        "Contract #",
                                        "Supplier",
                                        "Material",
                                        "Weight",
                                        "Netto",
                                        "Inner",
                                        "Outer",
                                        "Mark",
                                        "Plank",
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground"
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
                                            colSpan={10}
                                            className="text-center py-6 text-sm text-muted-foreground"
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
                                            <td className="px-3 py-2">
                                                {r.contract_number ?? "—"}
                                            </td>
                                            <td className="px-3 py-2">
                                                {r.supplier ?? "—"}
                                            </td>
                                            <td className="px-3 py-2">
                                                {r.raw_material_name ?? "—"}
                                            </td>
                                            <td className="px-3 py-2">
                                                {r.weight ?? "—"}
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
                                                {r.mark ?? "—"}
                                            </td>
                                            <td className="px-3 py-2">
                                                {r.plank ?? "—"}
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
                                    <th className="w-10 px-3 py-2" />
                                    {["Name", "Code", "SKU"].map((h) => (
                                        <th
                                            key={h}
                                            className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground"
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
                                            className="text-center py-6 text-sm text-muted-foreground"
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
                                            <td className="px-3 py-2">
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

            {/* Next button */}
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canNext}
                    className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                    Next →
                </button>
            </div>
        </div>
    )
}
