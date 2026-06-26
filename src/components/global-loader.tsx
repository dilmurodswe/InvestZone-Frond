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
        <div className="fixed bottom-5 right-5 z-[9999] flex items-center gap-2.5 rounded-full border bg-background/90 py-2 pr-4 pl-2.5 shadow-lg backdrop-blur animate-in fade-in slide-in-from-bottom-2">
            <LogoLoader size={26} />
            <span className="text-xs font-medium text-muted-foreground">
                {t("common.loading")}
            </span>
        </div>
    )
}
