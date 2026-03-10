import { useEffect, useRef } from "react"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
// import { toast } from "sonner"
import type { RawMaterialRequest, RequestStatus } from "../-types"
import { STATUS_CONFIG } from "./status-config"
import { API } from "@/lib/constants/api-endpoints"

interface StatusDropdownProps {
    request: RawMaterialRequest
    anchorEl: HTMLElement
    onClose: () => void
    onStatusChanged: (request: RawMaterialRequest) => void
}

const ALL_STATUSES = (Object.keys(STATUS_CONFIG) as unknown) as RequestStatus[]

export default function StatusDropdown({
    request,
    anchorEl,
    onClose,
    onStatusChanged,
}: StatusDropdownProps) {
    const ref = useRef<HTMLDivElement>(null)
    const { patch } = useRequest()
    const { invalidateByExactMatch } = useRevalidate()
    const rect = anchorEl.getBoundingClientRect()

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose()
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [onClose])

    const handleSelect = (status: RequestStatus) => {
        patch(
            API.RAW_MATERIAL_REQUESTS.ID.PATCH.replace("{id}", String(request.id)),
            { status },
            {
                onSuccess: () => {
                    invalidateByExactMatch([API.RAW_MATERIAL_ITEMS.INDEX])
                    // toast.success("Status updated")
                    onClose()
                    onStatusChanged({ ...request, status })
                },
            },
        )
    }

    return (
        <div
            ref={ref}
            style={{
                position: "fixed",
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                zIndex: 9999,
                minWidth: 160,
            }}
            className="bg-white rounded-xl shadow-lg border flex flex-col overflow-hidden"
        >
            {ALL_STATUSES.map((status) => {
                const config = STATUS_CONFIG[status]
                const isActive = request.status === status
                return (
                    <button
                        key={status}
                        onClick={() => handleSelect(status)}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                        style={{ opacity: isActive ? 0.5 : 1 }}
                        disabled={isActive}
                    >
                        <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: config.bg }}
                        />
                        {config.label}
                    </button>
                )
            })}
        </div>
    )
}