import { useIsFetching, useIsMutating } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import LogoLoader from "./ui/logo-loader"

/**
 * Global network activity indicator. Whenever any react-query request
 * (fetch or mutation) is in flight — e.g. slow internet or a delayed
 * backend — a small branded loader appears in the corner. A short delay
 * prevents flicker on fast responses.
 */
export default function GlobalLoader() {
    const { t } = useTranslation()
    const isFetching = useIsFetching()
    const isMutating = useIsMutating()
    const active = isFetching + isMutating > 0

    const [show, setShow] = useState(false)

    useEffect(() => {
        if (!active) return
        const id = setTimeout(() => setShow(true), 300)
        return () => {
            clearTimeout(id)
            setShow(false)
        }
    }, [active])

    if (!show) return null

    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center">
            <div className="pointer-events-auto flex flex-col items-center gap-4 rounded-2xl border bg-background/95 px-10 py-8 shadow-xl backdrop-blur animate-in fade-in zoom-in-95 duration-200">
                <LogoLoader size={52} />
                <span className="text-sm font-medium text-muted-foreground animate-pulse">
                    {t("common.loading")}
                </span>
            </div>
        </div>
    )
}
