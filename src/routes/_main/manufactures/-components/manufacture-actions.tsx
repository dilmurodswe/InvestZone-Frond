import { useModal } from "@/hooks/use-modal"
import { MoreHorizontal, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useManufactureStore } from "../-hooks/use-manufacture-store"
import type { Manufacture } from "../-types"

export function ManufactureActions({
    manufacture,
}: {
    manufacture: Manufacture
}) {
    const [open, setOpen] = useState(false)
    const [pos, setPos] = useState({ top: 0, left: 0 })
    const btnRef = useRef<HTMLButtonElement>(null)
    const ref = useRef<HTMLDivElement>(null)
    const { setManufacture } = useManufactureStore()
    const deleteModal = useModal("delete-manufacture")

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
                        className="flex items-center gap-2 text-sm text-red-500 hover:bg-muted"
                        onClick={() => {
                            setManufacture(manufacture)
                            deleteModal.openModal()
                            setOpen(false)
                        }}
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            )}
        </div>
    )
}
