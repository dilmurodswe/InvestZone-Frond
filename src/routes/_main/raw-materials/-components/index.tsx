import { CustomTable } from "@/components/custom/custom-table"
import FilterInput from "@/components/filter/filter-input"
import FilterSelect from "@/components/filter/filter-select"
import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import NoData from "@/components/no-data/nodata"
import Group from "@/components/semantic/group"
import i18n from "@/lib/i18n/request"
import { useRawMaterialsQuery } from "../-hooks/use-raw-materials-query"
import { getRawMaterialCols } from "./use-raw-material-cols"

export default function Index() {
    const { rawMaterialList, count, isFetching } = useRawMaterialsQuery()
    const cols = getRawMaterialCols()

    const STATUS_OPTIONS = [
        { id: "all", name: i18n.t("common.all") },
        { id: "received", name: i18n.t("status.inShop") },
        { id: "used", name: i18n.t("status.used") },
    ]

    return (
        <>
            <Navbar links={[{ label: "Raw materials" }]} />
            <Layout>
                <Group className="flex gap-3 flex-wrap items-center">
                    <FilterInput />
                    <FilterSelect
                        filterKey="status"
                        placeholder={i18n.t("table.status")}
                        options={STATUS_OPTIONS}
                        defaultValue={STATUS_OPTIONS[1]}
                    />
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
