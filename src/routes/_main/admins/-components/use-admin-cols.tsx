import Phone from "@/components/custom/phone"
import { Badge } from "@/components/ui/badge"
import { useModal } from "@/hooks/use-modal"
import { dateTimeColumn } from "@/lib/utils/common-cell-renderers"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useAdminStore } from "../-hooks/use-admin-store"
import type { Admin } from "../-types"

// eslint-disable-next-line react-refresh/only-export-components
function AdminActions({ admin }: { admin: Admin }) {
    const [open, setOpen] = useState(false)
    const [pos, setPos] = useState({ top: 0, left: 0 })
    const btnRef = useRef<HTMLButtonElement>(null)
    const ref = useRef<HTMLDivElement>(null)
    const { setAdmin } = useAdminStore()
    const addModal = useModal("add-admin")
    const deleteModal = useModal("delete-admin")

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
                left: rect.right + window.scrollX - 180, // 180px = dropdown width
            })
        }
        setOpen((v) => !v)
    }

    return (
        <div ref={ref} className="relative flex justify-end">
            <button
                ref={btnRef}
                onClick={handleOpen}
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
                        onClick={() => {
                            setAdmin(admin)
                            addModal.openModal()
                            setOpen(false)
                        }}
                    >
                        <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button
                        style={{ width: 180, height: 40, padding: "0 12px" }}
                        className="flex items-center gap-2 text-sm text-red-500 hover:bg-muted"
                        onClick={() => {
                            setAdmin(admin)
                            deleteModal.openModal()
                            setOpen(false)
                        }}
                    >
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                </div>
            )}
        </div>
    )
}

export const useAdminCols = (): ColumnDef<Admin>[] => {
    const { t } = useTranslation()
    return [
        {
            accessorKey: "phone_number",
            header: t("table.admin"),
            cell: ({ row: { original } }) => (
                <div className="text-sm">
                    <p className="font-medium">
                        {original.first_name} {original.last_name}
                    </p>
                    <Phone
                        value={original.phone_number}
                        className="text-muted-foreground"
                    />
                </div>
            ),
        },
        {
            accessorKey: "employee_code",
            header: t("table.employeeCode"),
            cell: ({ row: { original } }) => (
                <span className="text-sm">{original.employee_code ?? "—"}</span>
            ),
        },
        {
            accessorKey: "role",
            header: t("table.role"),
            cell: ({ row: { original } }) => (
                <Badge
                    variant={"secondary"}
                    className="capitalize font-semibold text-xs"
                >
                    {original.role}
                </Badge>
            ),
        },
        dateTimeColumn("date_joined", "Joined at"),
        {
            id: "actions",
            header: "",
            cell: ({ row: { original } }) => <AdminActions admin={original} />,
        },
    ]
}
