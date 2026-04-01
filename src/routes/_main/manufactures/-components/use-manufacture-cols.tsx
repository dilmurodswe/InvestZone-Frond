import { useModal } from "@/hooks/use-modal"
import type { ColumnDef } from "@tanstack/react-table"
import { useManufactureStore } from "../-hooks/use-manufacture-store"
import type { Manufacture } from "../-types"
import { ManufactureActions } from "./manufacture-actions"
import ManufactureStatusBadge from "./status-badge"

const fmtStr = (val: string | null | undefined) => (val?.trim() ? val : "—")

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
            accessorKey: "category",
            header: "Category",
            cell: ({ row: { original } }) => (
                <ClickableCell manufacture={original}>
                    <span className="text-sm hover:underline hover:text-primary">
                        {fmtStr(original.category)}
                    </span>
                </ClickableCell>
            ),
        },
        {
            accessorKey: "sub_category",
            header: "Sub category",
            cell: ({ row: { original } }) => (
                <ClickableCell manufacture={original}>
                    <span className="text-sm">
                        {fmtStr(original.sub_category)}
                    </span>
                </ClickableCell>
            ),
        },
        {
            accessorKey: "product",
            header: "Product",
            cell: ({ row: { original } }) => (
                <ClickableCell manufacture={original}>
                    <span className="text-sm">{fmtStr(original.product)}</span>
                </ClickableCell>
            ),
        },
        {
            accessorKey: "stock",
            header: "Stock",
            cell: ({ row: { original } }) => (
                <ClickableCell manufacture={original}>
                    <span className="text-sm">
                        {original.stock.toLocaleString()}
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
