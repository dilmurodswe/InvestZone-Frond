import { CustomTable } from "@/components/custom/custom-table"
import FilterInput from "@/components/filter/filter-input"
import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import NoData from "@/components/no-data/nodata"
import Group from "@/components/semantic/group"
import { useRawMaterialsQuery } from "../-hooks/use-raw-materials-query"
import { getRawMaterialCols } from "./use-raw-material-cols"

export default function Index() {
    const { rawMaterialList, count, isFetching } = useRawMaterialsQuery()
    const cols = getRawMaterialCols()

    return (
        <>
            <Navbar links={[{ label: "Raw materials" }]} />
            <Layout>
                <Group className="flex gap-4 flex-wrap justify-between">
                    <FilterInput />
                </Group>

                {!!rawMaterialList.length && (
                    <CustomTable
                        columns={cols}
                        data={rawMaterialList}
                        count={count}
                        isLoading={isFetching}
                    />
                )}

                {!rawMaterialList.length && !isFetching && <NoData />}
            </Layout>
        </>
    )
}
