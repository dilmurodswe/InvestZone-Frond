import { CustomTable } from "@/components/custom/custom-table"
import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import NoData from "@/components/no-data/nodata"
import Group from "@/components/semantic/group"
import { useReadyProductsQuery } from "../-hooks/use-ready-products-query"
import { getReadyProductCols } from "./use-ready-product-cols"

export default function Index() {
    const { readyProductList, count, isFetching } = useReadyProductsQuery()
    const cols = getReadyProductCols()

    return (
        <>
            <Navbar links={[{ label: "Ready products" }]} />
            <Layout>
                <Group className="flex gap-4 flex-wrap justify-between">
                    <h2 className="text-base font-semibold">Ready products</h2>
                </Group>

                {!!readyProductList.length && (
                    <CustomTable
                        columns={cols}
                        data={readyProductList}
                        count={count}
                        isLoading={isFetching}
                    />
                )}

                {!readyProductList.length && !isFetching && <NoData />}
            </Layout>
        </>
    )
}
