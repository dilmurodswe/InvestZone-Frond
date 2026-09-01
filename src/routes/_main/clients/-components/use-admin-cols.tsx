import { Badge } from "@/components/ui/badge"
import { useModal } from "@/hooks/use-modal"
import { formatDecimal } from "@/lib/utils/format-number"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useClientStore } from "../-hooks/use-client-store"
import type { Client } from "../-types"

// eslint-disable-next-line react-refresh/only-export-components
function ClientActions({ client }: { client: Client }) {
    const [open, setOpen] = useState(false)
    const [pos, setPos] = useState({ top: 0, left: 0 })
    const btnRef = useRef<HTMLButtonElement>(null)
    const ref = useRef<HTMLDivElement>(null)
    const { setClient } = useClientStore()
    const editModal = useModal()
    const deleteModal = useModal("delete-client")
    const { t } = useTranslation()

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const handleOpen = () => {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect()
            setPos({
                top: rect.bottom + window.scrollY + 4,
                left: rect.right + window.scrollX - 180,
            })
        }
        setOpen((v) => !v)
    }

    return (
        <div ref={ref} className="relative flex justify-end">
            <button
                ref={btnRef}
                onClick={(e) => {
                    e.stopPropagation()
                    handleOpen()
                }}
                className="p-1 rounded hover:bg-muted"
            >
                <MoreHorizontal className="w-5 h-5" />
            </button>
            {open && (
                <div
                    style={{
                        position: "fixed",
                        top: pos.top,
                        left: pos.left,
                        zIndex: 9999,
                    }}
                    className="bg-white rounded-xl shadow-lg border flex flex-col overflow-hidden"
                >
                    <button
                        style={{ width: 180, height: 40, padding: "0 12px" }}
                        className="flex items-center gap-2 text-sm hover:bg-muted"
                        onClick={(e) => {
                            e.stopPropagation()
                            setClient(client)
                            editModal.openModal()
                            setOpen(false)
                        }}
                    >
                        <Pencil className="w-4 h-4" /> {t("common.edit")}
                    </button>
                    <button
                        style={{ width: 180, height: 40, padding: "0 12px" }}
                        className="flex items-center gap-2 text-sm text-red-500 hover:bg-muted"
                        onClick={(e) => {
                            e.stopPropagation()
                            setClient(client)
                            deleteModal.openModal()
                            setOpen(false)
                        }}
                    >
                        <Trash2 className="w-4 h-4" /> {t("common.delete")}
                    </button>
                </div>
            )}
        </div>
    )
}

export const useClientCols = (): ColumnDef<Client>[] => {
    const { t } = useTranslation()
    const { setClient } = useClientStore()
    const detailModal = useModal("client-detail")

    const handleRowClick = (client: Client) => {
        setClient(client)
        detailModal.openModal()
    }

    return [
        {
            accessorKey: "company_name",
            header: t("table.company"),
            cell: ({ row: { original } }) => (
                <button
                    className="text-sm font-medium text-left hover:text-primary hover:underline transition-colors"
                    onClick={() => handleRowClick(original)}
                >
                    {original.company_name}
                </button>
            ),
        },
        {
            accessorKey: "company_email",
            header: t("table.email"),
            cell: ({ row: { original } }) => (
                <span
                    className="text-sm text-muted-foreground cursor-pointer"
                    onClick={() => handleRowClick(original)}
                >
                    {original.company_email || "—"}
                </span>
            ),
        },
        {
            accessorKey: "customer_type",
            header: t("table.clientType"),
            cell: ({ row: { original } }) => (
                <span
                    className="cursor-pointer"
                    onClick={() => handleRowClick(original)}
                >
                    {original.customer_type ?
                        <Badge
                            variant="secondary"
                            className="capitalize font-semibold text-xs"
                        >
                            {original.customer_type}
                        </Badge>
                    :   <span className="text-sm text-muted-foreground">—</span>
                    }
                </span>
            ),
        },
        {
            accessorKey: "official_name",
            header: t("table.address"),
            cell: ({ row: { original } }) => (
                <span
                    className="text-sm cursor-pointer"
                    onClick={() => handleRowClick(original)}
                >
                    {original.official_name || "—"}
                </span>
            ),
        },
        {
            accessorKey: "inn",
            header: t("table.inn"),
            cell: ({ row: { original } }) => (
                <span
                    className="text-sm cursor-pointer"
                    onClick={() => handleRowClick(original)}
                >
                    {original.inn || "—"}
                </span>
            ),
        },
        {
            accessorKey: "full_name",
            header: t("table.ceoStaff"),
            cell: ({ row: { original } }) => (
                <span
                    className="text-sm cursor-pointer"
                    onClick={() => handleRowClick(original)}
                >
                    {original.full_name}
                </span>
            ),
        },
        {
            accessorKey: "balance",
            header: t("table.balance"),
            cell: ({ row: { original } }) => (
                <span
                    className={`text-sm cursor-pointer font-semibold ${original.balance != null && Number(original.balance) < 0 ? "text-red-500" : "text-green-500"}`}
                    onClick={() => handleRowClick(original)}
                >
                    {original.balance != null ?
                        formatDecimal(Number(original.balance))
                    :   "—"}
                </span>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row: { original } }) => (
                <ClientActions client={original} />
            ),
        },
    ]
}
