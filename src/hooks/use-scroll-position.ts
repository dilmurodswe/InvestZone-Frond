import { useEffect, useState } from "react"

interface Args {
    containerId?: string
}

export function useScrollPosition({ containerId }: Args = {}) {
    const [scrollPosition, setScrollPosition] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            if (containerId) {
                const container = document.getElementById(containerId)
                if (container) {
                    setScrollPosition(container.scrollTop)
                }
            } else {
                setScrollPosition(window.scrollY)
            }
        }

        handleScroll()

        if (containerId) {
            const container = document.getElementById(containerId)
            if (container) {
                container.addEventListener("scroll", handleScroll, {
                    passive: true,
                })
                return () =>
                    container.removeEventListener("scroll", handleScroll)
            }
        } else {
            window.addEventListener("scroll", handleScroll, { passive: true })
            return () => window.removeEventListener("scroll", handleScroll)
        }
    }, [containerId])

    return scrollPosition
}
