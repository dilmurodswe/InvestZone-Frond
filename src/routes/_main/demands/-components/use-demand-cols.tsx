import { useModal } from "@/hooks/use-modal"
import i18n from "@/lib/i18n/request"
import { formatNumber } from "@/lib/utils/format-number"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Printer, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useDemandStore } from "../-hooks/use-demand-store"
import type { Demand } from "../-types"
import { DEMAND_PRINT_MODAL } from "./demand-print-modal"

const money = (val: string | number | null | undefined) =>
    formatNumber(val, { decimalScale: 2, isShowZero: true })

export function DemandActions({ demand }: { demand: Demand }) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const [pos, setPos] = useState({ top: 0, left: 0 })
    const btnRef = useRef<HTMLButtonElement>(null)
    const ref = useRef<HTMLDivElement>(null)
    const { setDemand } = useDemandStore()
    const editModal = useModal("edit-demand")
    const deleteModal = useModal("delete-demand")
    const printModal = useModal(DEMAND_PRINT_MODAL)

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
                            setDemand(demand)
                            editModal.openModal()
                            setOpen(false)
                        }}
                    >
                        <Pencil className="w-4 h-4" /> {t("common.edit")}
                    </button>
                    <button
                        style={{ width: 180, height: 40, padding: "0 12px" }}
                        className="flex items-center gap-2 text-sm hover:bg-muted"
                        onClick={(e) => {
                            e.stopPropagation()
                            setDemand(demand)
                            printModal.openModal()
                            setOpen(false)
                        }}
                    >
                        <Printer className="w-4 h-4" /> {t("print.appendix")}
                    </button>
                    <button
                        style={{ width: 180, height: 40, padding: "0 12px" }}
                        className="flex items-center gap-2 text-sm text-red-500 hover:bg-muted"
                        onClick={(e) => {
                            e.stopPropagation()
                            setDemand(demand)
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
            cell: ({ row: { original } }) => <DemandActions demand={original} />,
        },
    ]
}
