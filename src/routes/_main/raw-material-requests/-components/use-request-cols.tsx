import type { ColumnDef } from "@tanstack/react-table"
import type { RawMaterialRequest } from "../-types"
import { formatDecimal } from "@/lib/utils/format-number"
import StatusBadge from "./status-badge"
// eslint-disable-next-line react-x/no-unnecessary-use-prefix
export const useRequestCols = (
    onRowClick: (request: RawMaterialRequest) => void,
    onStatusClick: (request: RawMaterialRequest, el: HTMLElement) => void,
): ColumnDef<RawMaterialRequest>[] => {
    return [
        {
            accessorKey: "contract_number",
            header: "Contract number",
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
            header: "Quantity",
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
            header: "Supplier",
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
            header: "Date",
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
            header: "Status",
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
            header: "Tolerants",
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
            header: "Difference",
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
