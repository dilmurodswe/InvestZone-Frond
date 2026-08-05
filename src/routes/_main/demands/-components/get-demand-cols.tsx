/**
 * Otgruzkalar ro'yxatining ustunlari.
 *
 * Buyurtmalardagi kabi alohida fayl: ustunlar tavsifi komponent emas, va u
 * `DemandActions` bilan bir faylda tursa Fast Refresh butun modulni qayta
 * yuklashga majbur bo'ladi.
 */

import { useModal } from "@/hooks/use-modal"
import i18n from "@/lib/i18n/request"
import { formatNumber } from "@/lib/utils/format-number"
import type { ColumnDef } from "@tanstack/react-table"
import { useDemandStore } from "../-hooks/use-demand-store"
import type { Demand } from "../-types"
import { DemandActions } from "./use-demand-cols"

const money = (val: string | number | null | undefined) =>
    formatNumber(val, { decimalScale: 2, isShowZero: true })

export const getDemandCols = (): ColumnDef<Demand>[] => {
    function ClickableCell({
        demand,
        children,
    }: {
        demand: Demand
        children: React.ReactNode
    }) {
        const { setDemand } = useDemandStore()
        const detailModal = useModal("demand-detail")

        return (
            <span
                className="cursor-pointer"
                onClick={() => {
                    setDemand(demand)
                    detailModal.openModal()
                }}
            >
                {children}
            </span>
        )
    }

    return [
        {
            accessorKey: "number",
            header: i18n.t("table.docNumber"),
            cell: ({ row: { original } }) => (
                <ClickableCell demand={original}>
                    <span className="text-sm font-medium">
                        {original.number}
                    </span>
                </ClickableCell>
            ),
        },
        {
            accessorKey: "doc_date",
            header: i18n.t("table.date"),
            cell: ({ row: { original } }) => (
                <ClickableCell demand={original}>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {original.doc_date?.slice(0, 10) ?? "—"}
                    </span>
                </ClickableCell>
            ),
        },
        {
            accessorKey: "client",
            header: i18n.t("table.client"),
            cell: ({ row: { original } }) => (
                <ClickableCell demand={original}>
                    <span className="text-sm">
                        {original.client?.full_name ?? "—"}
                    </span>
                </ClickableCell>
            ),
        },
        {
            accessorKey: "order_number",
            header: i18n.t("table.order"),
            cell: ({ row: { original } }) => (
                <ClickableCell demand={original}>
                    <span className="text-sm">
                        {original.order_number ?? "—"}
                    </span>
                </ClickableCell>
            ),
        },
        {
            accessorKey: "total_with_vat",
            header: i18n.t("table.sum"),
            cell: ({ row: { original } }) => (
                <ClickableCell demand={original}>
                    <span className="text-sm font-medium whitespace-nowrap">
                        {money(original.total_with_vat)}{" "}
                        {original.currency?.currency}
                    </span>
                </ClickableCell>
            ),
        },
        {
            accessorKey: "transport_number",
            header: i18n.t("table.transportNumber"),
            cell: ({ row: { original } }) => (
                <ClickableCell demand={original}>
                    <span className="text-sm">
                        {original.transport_number || "—"}
                    </span>
                </ClickableCell>
            ),
        },
        {
            accessorKey: "applicable",
            header: i18n.t("table.posted"),
            cell: ({ row: { original } }) => (
                <ClickableCell demand={original}>
                    <span className="text-sm">
                        {original.applicable ?
                            i18n.t("common.yes")
                        :   i18n.t("common.no")}
                    </span>
                </ClickableCell>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row: { original } }) => (
                <DemandActions demand={original} />
            ),
        },
    ]
}
