import * as React from "react"

export function useIsMobile(opts?: { mobileBreakPoint?: number }) {
    const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
        undefined,
    )
    const mobileBreakPoint = opts?.mobileBreakPoint || 768

    React.useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${mobileBreakPoint - 1}px)`)
        const onChange = () => {
            setIsMobile(window.innerWidth < mobileBreakPoint)
        }
        mql.addEventListener("change", onChange)
        setIsMobile(window.innerWidth < mobileBreakPoint)
        return () => mql.removeEventListener("change", onChange)
    }, [mobileBreakPoint])

    return !!isMobile
}
