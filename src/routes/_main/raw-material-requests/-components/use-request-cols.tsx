import { formatDecimal } from "@/lib/utils/format-number"
import type { ColumnDef } from "@tanstack/react-table"
import { useTranslation } from "react-i18next"
import type { RawMaterialRequest } from "../-types"
import StatusBadge from "./status-badge"
export const useRequestCols = (
    onRowClick: (request: RawMaterialRequest) => void,
    onStatusClick: (request: RawMaterialRequest, el: HTMLElement) => void,
): ColumnDef<RawMaterialRequest>[] => {
    const { t } = useTranslation()
    return [
        {
            accessorKey: "contract_number",
            header: t("table.contractNumber"),
            cell: ({ row: { original } }) => (
                <button
                    className="w-full text-left text-sm font-medium hover:text-primary hover:underline"
                    onClick={() => onRowClick(original)}
                >
                    {original.contract_number ?? "—"}
                </button>
            ),
        },
        {
            accessorKey: "quantity",
            header: t("table.quantity"),
            cell: ({ row: { original } }) => (
                <button
                    className="w-full text-left text-sm"
                    onClick={() => onRowClick(original)}
                >
                    {original.quantity ?? "—"} t
                </button>
            ),
        },
        {
            accessorKey: "supplier",
            header: t("table.supplier"),
            cell: ({ row: { original } }) => (
                <button
                    className="w-full text-left text-sm"
                    onClick={() => onRowClick(original)}
                >
                    {original.supplier ?? "—"}
                </button>
            ),
        },
        {
            accessorKey: "created_at",
            header: t("table.date"),
            cell: ({ row: { original } }) => (
                <button
                    className="w-full text-left text-sm"
                    onClick={() => onRowClick(original)}
                >
                    {original.created_at ?
                        new Date(original.created_at).toLocaleDateString()
                    :   "—"}
                </button>
            ),
        },
        {
            accessorKey: "status",
            header: t("table.status"),
            cell: ({ row: { original } }) => (
                <StatusBadge
                    status={original.status}
                    onClick={(e) => {
                        onStatusClick(original, e.currentTarget)
                    }}
                />
            ),
        },
        {
            accessorKey: "tolerant",
            header: t("table.tolerance"),
            cell: ({ row: { original } }) => (
                <button
                    className="w-full text-left text-sm"
                    onClick={() => onRowClick(original)}
                >
                    {original.tolerant ? `${original.tolerant}%` : "—"}
                </button>
            ),
        },
        {
            accessorKey: "differance",
            header: t("table.difference"),
            cell: ({ row: { original } }) => {
                const val = original.differance
                if (!val)
                    return (
                        <button
                            className="w-full text-left text-sm"
                            onClick={() => onRowClick(original)}
                        >
                            —
                        </button>
                    )
                const isPositive = val > 0
                return (
                    <button
                        className="w-full text-left text-sm font-semibold"
                        style={{ color: isPositive ? "#16C647" : "#E73C50" }}
                        onClick={() => onRowClick(original)}
                    >
                        {isPositive ? "+" : ""}
                        {formatDecimal(val)} $
                    </button>
                )
            },
        },
    ]
}
