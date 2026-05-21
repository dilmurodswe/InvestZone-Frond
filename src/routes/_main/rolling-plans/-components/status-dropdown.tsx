import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { API } from "@/lib/constants/api-endpoints"
import { useEffect, useRef } from "react"
import type { RollingPlan, RollingPlanStatus } from "../-types"
import {
    ALL_ROLLING_PLAN_STATUSES,
    ROLLING_PLAN_STATUS_CONFIG,
} from "./status-config"

interface StatusDropdownProps {
    rollingPlan: RollingPlan
    anchorEl: HTMLElement
    onClose: () => void
    onStatusChanged: (plan: RollingPlan) => void
}

export default function RollingPlanStatusDropdown({
    rollingPlan,
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

    const handleSelect = (status: RollingPlanStatus) => {
        patch(
            API.ROLLING_PLANS.ID.replace("{id}", String(rollingPlan.id)),
            {
                machine: rollingPlan.machine?.id,
                items: rollingPlan.items.map((item) => ({
                    ready_strip: item.ready_strip,
                    status,
                })),
            },
            {
                onSuccess: () => {
                    invalidateByExactMatch([API.ROLLING_PLANS.INDEX])
                    onClose()
                    onStatusChanged({ ...rollingPlan, status })
                },
            },
        )
    }

    const currentStatus = rollingPlan.status ?? rollingPlan.items?.[0]?.status

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
            className="bg-white rounded-xl shadow-lg border flex flex-col overflow-y-auto max-h-[240px]"
        >
            {ALL_ROLLING_PLAN_STATUSES.map((status) => {
                const config = ROLLING_PLAN_STATUS_CONFIG[status]
                const isActive = currentStatus === status
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
