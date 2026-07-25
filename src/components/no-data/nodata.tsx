"use client"

import IconInbox from "@/assets/icons/inbox"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"

interface NoDataProps {
    title?: string
    description?: string
    children?: ReactNode
}

const NoData = ({ title, description, children }: NoDataProps) => {
    const { t } = useTranslation()
    const heading = title ?? t("common.noDataTitle")
    const subtitle = description ?? t("common.noDataDescription")

    return (
        <div className="h-full flex flex-col items-center justify-center p-6 rounded-xl border-dashed border-gray-300 text-center space-y-1">
            {/* <InboxIcon className="h-12 w-12 text-gray-400" /> */}
            <IconInbox />
            {!!heading && (
                <h3 className="text-gray-700 text-lg font-semibold">
                    {heading}
                </h3>
            )}
            {!!subtitle && <p className="text-gray-500 text">{subtitle} </p>}
            {children}
        </div>
    )
}

export default NoData
