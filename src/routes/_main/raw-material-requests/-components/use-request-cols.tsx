import type { ColumnDef } from "@tanstack/react-table"
import type { RawMaterialRequest } from "../-types"
import StatusBadge from "./status-badge"

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
                <span className="text-sm">{original.quantity ?? "—"} t</span>
            ),
        },
        {
            accessorKey: "supplier",
            header: "Supplier",
            cell: ({ row: { original } }) => (
                <span className="text-sm">{original.supplier ?? "—"}</span>
            ),
        },
        {
            accessorKey: "created_at",
            header: "Date",
            cell: ({ row: { original } }) => (
                <span className="text-sm">
                    {original.created_at
                        ? new Date(original.created_at).toLocaleDateString()
                        : "—"}
                </span>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row: { original } }) => (
                <StatusBadge
                    status={original.status}
                    onClick={(e) => onStatusClick(original, e.currentTarget)}
                />
            ),
        },
        {
            accessorKey: "tolerant",
            header: "Tolerants",
            cell: ({ row: { original } }) => (
                <span className="text-sm">
                    {original.tolerant ? `${original.tolerant}%` : "—"}
                </span>
            ),
        },
        {
            accessorKey: "accepted_ton",
            header: "Accepted tonn",
            cell: ({ row: { original } }) => (
                <span className="text-sm">
                    {original.accepted_ton ? `${original.accepted_ton} t` : "—"}
                </span>
            ),
        },
        {
            accessorKey: "differance",
            header: "Difference",
            cell: ({ row: { original } }) => {
                const val = original.differance
                if (!val) return <span className="text-sm">—</span>
                const isPositive = val > 0
                return (
                    <span
                        className="text-sm font-semibold"
                        style={{ color: isPositive ? "#16C647" : "#E73C50" }}
                    >
                        {isPositive ? "+" : ""}
                        {val.toLocaleString()} $
                    </span>
                )
            },
        },
    ]
}