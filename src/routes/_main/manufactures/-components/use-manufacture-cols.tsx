import { useModal } from "@/hooks/use-modal"
import type { ColumnDef } from "@tanstack/react-table"
import { CheckCircle2, Clock } from "lucide-react"
import { useManufactureStore } from "../-hooks/use-manufacture-store"
import type { Manufacture } from "../-types"
import { ManufactureActions } from "./manufacture-actions"
import { ManufacturePrintButton } from "./manufacture-print-button"
import ManufactureStatusBadge from "./status-badge"

const fmt = (val: string | number | null | undefined) =>
    val != null && val !== "" ? val : "—"

export const getManufactureCols = (
    onStatusClick: (manufacture: Manufacture, el: HTMLElement) => void,
): ColumnDef<Manufacture>[] => {
    function ClickableCell({
        manufacture,
        children,
    }: {
        manufacture: Manufacture
        children: React.ReactNode
    }) {
        const { setManufacture } = useManufactureStore()
        const detailModal = useModal("manufacture-detail")

        return (
            <span
                className="cursor-pointer"
                onClick={() => {
                    setManufacture(manufacture)
                    detailModal.openModal()
                }}
            >
                {children}
            </span>
        )
    }

    return [
        {
            id: "id",
            header: "ID",
            cell: ({ row: { original } }) => (
                <ClickableCell manufacture={original}>
                    <span className="text-sm text-muted-foreground">
                        {original.id}
                    </span>
                </ClickableCell>
            ),
        },
        {
            id: "products",
            header: "Products",
            cell: ({ row: { original } }) => {
                const names = original.detail_items
                    .map((d) => d.product.outer_dimension)
                    .join(", ")
                return (
                    <ClickableCell manufacture={original}>
                        <span className="text-sm" title={names}>
                            {names.length > 40 ?
                                names.slice(0, 40) + "…"
                            :   names || "—"}
                        </span>
                    </ClickableCell>
                )
            },
        },
        {
            accessorKey: "thickness",
            header: "Thickness",
            cell: ({ row: { original } }) => (
                <ClickableCell manufacture={original}>
                    <span className="text-sm">{fmt(original.thickness)}</span>
                </ClickableCell>
            ),
        },
        {
            accessorKey: "width",
            header: "Width",
            cell: ({ row: { original } }) => (
                <ClickableCell manufacture={original}>
                    <span className="text-sm">{fmt(original.width)}</span>
                </ClickableCell>
            ),
        },

        {
            id: "raw_count",
            header: "Raw Materials",
            cell: ({ row: { original } }) => (
                <ClickableCell manufacture={original}>
                    <span className="text-sm">
                        {original.raw_item_details.length > 0 ?
                            `${original.raw_item_details.length} item(s)`
                        :   "—"}
                    </span>
                </ClickableCell>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row: { original } }) => (
                <ManufactureStatusBadge
                    status={original.status}
                    onClick={(e) => onStatusClick(original, e.currentTarget)}
                />
            ),
        },
        {
            accessorKey: "created_at",
            header: "Date",
            cell: ({ row: { original } }) => (
                <ClickableCell manufacture={original}>
                    <span className="text-sm text-muted-foreground">
                        {new Date(original.created_at).toLocaleDateString()}
                    </span>
                </ClickableCell>
            ),
        },
        {
            id: "is_plan_fact",
            header: "План-факт",
            cell: ({ row: { original } }) => (
                <ClickableCell manufacture={original}>
                    {original.is_plan_fact ?
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-700 text-xs font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Есть
                        </span>
                    :   <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            Нет
                        </span>
                    }
                </ClickableCell>
            ),
        },
        {
            id: "print_label",
            header: "Печать",
            cell: ({ row: { original } }) => (
                <ManufacturePrintButton manufacture={original} />
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row: { original } }) => (
                <ManufactureActions manufacture={original} />
            ),
        },
    ]
}
