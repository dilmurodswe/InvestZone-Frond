// ─────────────────────────────────────────────────────────────────────────────
// rolling-plan-actions.tsx  (to'liq yangilangan)
// ─────────────────────────────────────────────────────────────────────────────
import { useModal } from "@/hooks/use-modal"
import { ClipboardList, MoreHorizontal, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useRollingPlanStore } from "../-hooks/use-rolling-plan-store"
import type { RollingPlan } from "../-types"

export function RollingPlanActions({
    rollingPlan,
}: {
    rollingPlan: RollingPlan
}) {
    const [open, setOpen] = useState(false)
    const [pos, setPos] = useState({ top: 0, left: 0 })
    const btnRef = useRef<HTMLButtonElement>(null)
    const ref = useRef<HTMLDivElement>(null)
    const { setRollingPlan } = useRollingPlanStore()
    const deleteModal = useModal("delete-rolling-plan")
    const factModal = useModal("rolling-plan-fact")

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
                left: rect.right + window.scrollX - 200,
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
                    {/* Plan Fact */}
                    <button
                        style={{ width: 200, height: 40, padding: "0 12px" }}
                        className="flex items-center gap-2 text-sm hover:bg-muted text-foreground"
                        onClick={() => {
                            setRollingPlan(rollingPlan)
                            factModal.openModal()
                            setOpen(false)
                        }}
                    >
                        <ClipboardList className="w-4 h-4 text-primary" />
                        План-факт
                    </button>

                    <div className="border-t mx-2" />

                    {/* Delete */}
                    <button
                        style={{ width: 200, height: 40, padding: "0 12px" }}
                        className="flex items-center gap-2 text-sm text-red-500 hover:bg-muted"
                        onClick={() => {
                            setRollingPlan(rollingPlan)
                            deleteModal.openModal()
                            setOpen(false)
                        }}
                    >
                        <Trash2 className="w-4 h-4" />
                        Удалить
                    </button>
                </div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// use-rolling-plan-cols.tsx  (outer_dimension qo'shilgan)
// ─────────────────────────────────────────────────────────────────────────────
// Pastdagi export getRollingPlanCols ni shu fayl ichiga qo'shing yoki
// alohida fayl sifatida saqlang. Farqi faqat "outer_dimension" ustuni.

/*
  Quyidagi ustunni "thickness" dan OLDIN qo'shing:

  {
      id: "outer_dimension",
      header: "Нар. размер",
      cell: ({ row: { original } }) => {
          const dims = [
              ...new Set(
                  original.items
                      ?.map((i) => i.product?.outer_dimension)
                      .filter(Boolean),
              ),
          ]
          return (
              <ClickableCell plan={original}>
                  <span className="text-sm">
                      {dims.length ? dims.join(", ") : "—"}
                  </span>
              </ClickableCell>
          )
      },
  },
*/
