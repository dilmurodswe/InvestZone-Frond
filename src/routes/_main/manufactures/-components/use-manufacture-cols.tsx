import { useModal } from "@/hooks/use-modal"
import type { ColumnDef } from "@tanstack/react-table"
import { useManufactureStore } from "../-hooks/use-manufacture-store"
import type { Manufacture } from "../-types"
import { ManufactureActions } from "./manufacture-actions"
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
                    .map((d) => d.product.name)
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
            id: "actions",
            header: "",
            cell: ({ row: { original } }) => (
                <ManufactureActions manufacture={original} />
            ),
        },
    ]
}
