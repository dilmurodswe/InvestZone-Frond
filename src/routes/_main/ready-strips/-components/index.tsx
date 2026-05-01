import { CustomTable } from "@/components/custom/custom-table"
import FilterInput from "@/components/filter/filter-input"
import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import NoData from "@/components/no-data/nodata"
import Group from "@/components/semantic/group"
import { useReadyStripsQuery } from "../-hooks/use-ready-strips-query"
import { getReadyStripCols } from "./use-ready-strip-cols"

export default function Index() {
    const { readyStripList, count, isFetching } = useReadyStripsQuery()
    const cols = getReadyStripCols()

    return (
        <>
            <Navbar links={[{ label: "Ready strips" }]} />
            <Layout>
                <Group className="flex gap-4 flex-wrap justify-between">
                    <FilterInput />
                </Group>

                {!!readyStripList.length && (
                    <CustomTable
                        columns={cols}
                        data={readyStripList}
                        count={count}
                        isLoading={isFetching}
                    />
                )}

                {!readyStripList.length && !isFetching && <NoData />}
            </Layout>
        </>
    )
}
