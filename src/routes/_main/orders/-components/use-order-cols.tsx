import { useModal } from "@/hooks/use-modal"
import { usePrintVariant } from "@/lib/print/use-print-variant"
import { MoreHorizontal, Pencil, Printer, Trash2, Truck } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useOrderStore } from "../-hooks/use-order-store"
import type { Order } from "../-types"
import { ORDER_PRINT_MODAL } from "./order-print-modal"

export function OrderActions({ order }: { order: Order }) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const [pos, setPos] = useState({ top: 0, left: 0 })
    const btnRef = useRef<HTMLButtonElement>(null)
    const ref = useRef<HTMLDivElement>(null)
    const { setOrder } = useOrderStore()
    const addModal = useModal("add-order")
    const deleteModal = useModal("delete-order")
    const printModal = useModal(ORDER_PRINT_MODAL)
    const { setVariant } = usePrintVariant()
    const createDemandModal = useModal("create-demand")

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
                            setOrder(order)
                            addModal.openModal()
                            setOpen(false)
                        }}
                    >
                        <Pencil className="w-4 h-4" /> {t("common.edit")}
                    </button>
                    {/* Ro'yxat qatorida beshta formani sanab o'tirish uzun
                        bo'lardi — oynaning o'zida ular yo'lakcha bo'lib turadi,
                        shuning uchun bu yerdan hujjat odatdagi «Приложение»
                        bilan ochiladi. */}
                    <button
                        style={{ width: 180, height: 40, padding: "0 12px" }}
                        className="flex items-center gap-2 text-sm hover:bg-muted"
                        onClick={(e) => {
                            e.stopPropagation()
                            setOrder(order)
                            setVariant("appendix")
                            printModal.openModal()
                            setOpen(false)
                        }}
                    >
                        <Printer className="w-4 h-4" /> {t("print.print")}
                    </button>
                    <button
                        style={{ width: 180, height: 40, padding: "0 12px" }}
                        className="flex items-center gap-2 text-sm hover:bg-muted"
                        onClick={(e) => {
                            e.stopPropagation()
                            setOrder(order)
                            createDemandModal.openModal()
                            setOpen(false)
                        }}
                    >
                        <Truck className="w-4 h-4" /> {t("common.createDemand")}
                    </button>
                    <button
                        style={{ width: 180, height: 40, padding: "0 12px" }}
                        className="flex items-center gap-2 text-sm text-red-500 hover:bg-muted"
                        onClick={(e) => {
                            e.stopPropagation()
                            setOrder(order)
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
