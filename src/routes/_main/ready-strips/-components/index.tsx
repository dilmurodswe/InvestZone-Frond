import { CustomTable } from "@/components/custom/custom-table"
import FilterInput from "@/components/filter/filter-input"
import FilterSelect from "@/components/filter/filter-select"
import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import NoData from "@/components/no-data/nodata"
import Group from "@/components/semantic/group"
import i18n from "@/lib/i18n/request"
import { useReadyStripsQuery } from "../-hooks/use-ready-strips-query"
import { getReadyStripCols } from "./use-ready-strip-cols"

export default function Index() {
    const { readyStripList, count, isFetching } = useReadyStripsQuery()
    const cols = getReadyStripCols()

    const STATUS_OPTIONS = [
        { id: "", name: i18n.t("common.all") },
        { id: "active", name: i18n.t("status.inShop") },
        { id: "used", name: i18n.t("status.used") },
    ]

    return (
        <>
            <Navbar links={[{ label: "Ready strips" }]} />
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
