"use client"

import IconInbox from "@/assets/icons/inbox"
import type { ReactNode } from "react"

interface NoDataProps {
    title?: string
    description?: string
    children?: ReactNode
}

const NoData = ({
    title = "Information not found",
    description = "No anything at the moment",
    children,
}: NoDataProps) => {
    return (
        <div className="h-full flex flex-col items-center justify-center p-6 rounded-xl border-dashed border-gray-300 text-center space-y-1">
            {/* <InboxIcon className="h-12 w-12 text-gray-400" /> */}
            <IconInbox />
            {!!title && (
                <h3 className="text-gray-700 text-lg font-semibold">{title}</h3>
            )}
            {!!description && (
                <p className="text-gray-500 text">{description} </p>
            )}
            {children}
        </div>
    )
}

export default NoData
