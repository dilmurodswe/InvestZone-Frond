import { CustomTable } from "@/components/custom/custom-table"
import FilterInput from "@/components/filter/filter-input"
import FilterSelect from "@/components/filter/filter-select"
import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import NoData from "@/components/no-data/nodata"
import Group from "@/components/semantic/group"
import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"
import i18n from "@/lib/i18n/request"
import { formatDecimal } from "@/lib/utils/format-number"
import { useNavigate, useParams } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { useBatchStripsQuery } from "../-hooks/use-batch-strips-query"
import { getReadyStripCols } from "../../-components/use-ready-strip-cols"
import { useStripBatchStore } from "../../-hooks/use-strip-batch-store"
import ManufactureStatusBadge from "../../../manufactures/-components/status-badge"

export default function Index() {
    const { manufactureId } = useParams({ strict: false })
    const navigate = useNavigate()
    const { batch } = useStripBatchStore()
    const { stripList, count, isFetching } = useBatchStripsQuery(manufactureId)
    const cols = getReadyStripCols()

    const first = stripList[0]
    const productName = batch?.product_name ?? first?.product_name ?? "—"
    const productsExtra =
        batch && batch.products_count > 1 ? ` +${batch.products_count - 1}` : ""
    const status = batch?.status ?? first?.manufacture_status ?? null
    const createdAt = batch?.created_at ?? first?.created_at
    const stripCount = batch?.strip_count ?? count
    const totalWeight = batch?.total_weight ?? null

    const STATUS_OPTIONS = [
        { id: "", name: i18n.t("common.all") },
        { id: "active", name: i18n.t("status.inShop") },
        { id: "used", name: i18n.t("status.used") },
    ]

    return (
        <>
            <Navbar links={[{ label: "Ready strips" }]} />
            <Layout>
                {/* Header */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate({ to: "/ready-strips" })}
                        >
                            <ArrowLeft size={16} />
                            {i18n.t("common.back")}
                        </Button>
                        <CardTitle>Reska #{manufactureId}</CardTitle>
                        {status && <ManufactureStatusBadge status={status} />}
                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-y border rounded-lg overflow-hidden">
                    <Cell
                        label={i18n.t("table.productName")}
                        value={`${productName}${productsExtra}`}
                    />
                    <Cell
                        label={i18n.t("table.stripsCount")}
                        value={stripCount}
                    />
                    <Cell
                        label={i18n.t("table.totalWeight")}
                        value={
                            totalWeight != null ?
                                formatDecimal(totalWeight)
                            :   undefined
                        }
                    />
                    <Cell
                        label={i18n.t("table.otxod")}
                        value={
                            batch?.left_over != null ?
                                formatDecimal(batch.left_over)
                            :   undefined
                        }
                    />
                    <Cell
                        label={i18n.t("table.date")}
                        value={
                            createdAt ?
                                new Date(createdAt).toLocaleDateString()
                            :   undefined
                        }
                    />
                </div>

                <Group className="flex gap-3 flex-wrap items-center">
                    <FilterInput />
                    <FilterSelect
                        filterKey="status"
                        placeholder={i18n.t("table.status")}
                        options={STATUS_OPTIONS}
                        defaultValue={STATUS_OPTIONS[0]}
                    />
                </Group>

                {!!stripList.length && (
                    <CustomTable
                        columns={cols}
                        data={stripList}
                        count={count}
                        isLoading={isFetching}
                    />
                )}

                {!stripList.length && !isFetching && <NoData />}
            </Layout>
        </>
    )
}

function Cell({
    label,
    value,
}: {
    label: string
    value: string | number | null | undefined
}) {
    return (
        <div className="flex flex-col gap-0.5 px-4 py-3">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-sm font-medium break-words">
                {value != null && value !== "" ?
                    String(value)
                :   <span className="text-muted-foreground font-normal">—</span>
                }
            </span>
        </div>
    )
}
