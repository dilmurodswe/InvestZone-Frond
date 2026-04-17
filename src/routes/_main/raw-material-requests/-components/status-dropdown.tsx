import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { API } from "@/lib/constants/api-endpoints"
import { useEffect, useRef, useState } from "react"
import type { RawMaterialRequest, RequestStatus } from "../-types"
import { STATUS_CONFIG } from "./status-config"

interface StatusDropdownProps {
    request: RawMaterialRequest
    anchorEl: HTMLElement
    onClose: () => void
    onStatusChanged: (request: RawMaterialRequest) => void
}

const STATUS_ORDER: RequestStatus[] = [1, 2, 3, 4, 5, 6]

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
    const [pendingStatus, setPendingStatus] = useState<RequestStatus | null>(
        null,
    )

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose()
            }
        }
        // pendingStatus yo'q bo'lgandagina tashqi click handler ishlaydi
        if (!pendingStatus) {
            document.addEventListener("mousedown", handler)
        }
        return () => document.removeEventListener("mousedown", handler)
    }, [onClose, pendingStatus])

    const currentIndex = STATUS_ORDER.indexOf(request.status)

    const handleSelect = (status: RequestStatus) => {
        setPendingStatus(status)
    }

    const handleConfirm = () => {
        if (!pendingStatus) return
        const statusToSet = pendingStatus
        setPendingStatus(null)
        patch(
            API.RAW_MATERIAL_REQUESTS.ID.PATCH.replace(
                "{id}",
                String(request.id),
            ),
            { status: statusToSet },
            {
                onSuccess: () => {
                    invalidateByExactMatch([API.RAW_MATERIAL_ITEMS.INDEX])
                    onStatusChanged({ ...request, status: statusToSet })
                    onClose()
                },
            },
        )
    }

    const handleCancel = () => {
        setPendingStatus(null)
    }

    return (
        <>
            {!pendingStatus && (
                <div
                    ref={ref}
                    style={{
                        position: "fixed",
                        top: rect.bottom + window.scrollY + 4,
                        left: rect.left + window.scrollX,
                        zIndex: 9999,
                        minWidth: 160,
                    }}
                    className="bg-white rounded-xl shadow-lg border flex flex-col overflow-y-auto max-h-[232px]"
                >
                    {STATUS_ORDER.map((status, index) => {
                        const config = STATUS_CONFIG[status]
                        const isActive = request.status === status
                        const isDisabled = isActive || index <= currentIndex
                        return (
                            <button
                                key={status}
                                onClick={() => handleSelect(status)}
                                disabled={isDisabled}
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
            )}

            <AlertDialog
                open={!!pendingStatus}
                onOpenChange={(open) => {
                    if (!open) setPendingStatus(null)
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Status o'zgartirilsinmi?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingStatus && (
                                <>
                                    <strong>
                                        {STATUS_CONFIG[request.status]?.label}
                                    </strong>
                                    {" → "}
                                    <strong>
                                        {STATUS_CONFIG[pendingStatus]?.label}
                                    </strong>
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancel}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm}>
                            OK
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
