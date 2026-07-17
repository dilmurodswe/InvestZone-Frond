import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { API } from "@/lib/constants/api-endpoints"
import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import type { Manufacture, ManufactureStatus } from "../-types"
import {
    ALL_MANUFACTURE_STATUSES,
    MANUFACTURE_STATUS_CONFIG,
} from "./status-config"

interface StatusDropdownProps {
    manufacture: Manufacture
    anchorEl: HTMLElement
    onClose: () => void
    onStatusChanged: (manufacture: Manufacture) => void
}

export default function ManufactureStatusDropdown({
    manufacture,
    anchorEl,
    onClose,
    onStatusChanged,
}: StatusDropdownProps) {
    const ref = useRef<HTMLDivElement>(null)
    const { t } = useTranslation()
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

    const handleSelect = (status: ManufactureStatus) => {
        patch(
            API.MANUFACTURES.ID.replace("{id}", String(manufacture.id)),
            { status },
            {
                onSuccess: () => {
                    invalidateByExactMatch([API.MANUFACTURES.INDEX])
                    onClose()
                    onStatusChanged({ ...manufacture, status })
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
            className="bg-white rounded-xl shadow-lg border flex flex-col overflow-y-auto max-h-[232px]"
        >
            {ALL_MANUFACTURE_STATUSES.map((status) => {
                const config = MANUFACTURE_STATUS_CONFIG[status]
                const isActive = manufacture.status === status
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
                        {t(config.labelKey as never)}
                    </button>
                )
            })}
        </div>
    )
}
