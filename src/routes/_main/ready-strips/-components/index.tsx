import { CustomTable } from "@/components/custom/custom-table"
import FilterInput from "@/components/filter/filter-input"
import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import NoData from "@/components/no-data/nodata"
import Group from "@/components/semantic/group"
import { useNavigate } from "@tanstack/react-router"
import { useStripBatchStore } from "../-hooks/use-strip-batch-store"
import { useStripBatchesQuery } from "../-hooks/use-strip-batches-query"
import { getStripBatchCols } from "./use-strip-batch-cols"

export default function Index() {
    const { batchList, count, isFetching } = useStripBatchesQuery()
    const cols = getStripBatchCols()
    const { setBatch } = useStripBatchStore()
    const navigate = useNavigate()

    return (
        <>
            <Navbar links={[{ label: "Ready strips" }]} />
            <Layout>
                <Group className="flex gap-3 flex-wrap items-center">
                    <FilterInput />
                </Group>

                {!!batchList.length && (
                    <CustomTable
                        columns={cols}
                        data={batchList}
                        count={count}
                        isLoading={isFetching}
                        onRowClick={(batch) => {
                            setBatch(batch)
                            navigate({
                                to: "/ready-strips/$manufactureId",
                                params: { manufactureId: String(batch.id) },
                            })
                        }}
                    />
                )}

                {!batchList.length && !isFetching && <NoData />}
            </Layout>
        </>
    )
}
