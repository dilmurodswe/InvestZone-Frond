import { type CarouselApi } from "@/components/ui/carousel"
import { useCallback, useEffect, useState } from "react"

export const useEmblaState = () => {
    const [api, setApi] = useState<CarouselApi | null>(null)
    const [selectedIndex, setSelectedIndex] = useState(0)

    const scrollTo = useCallback((index: number) => api?.scrollTo(index), [api])

    useEffect(() => {
        if (!api) return
        const onSelect = () => setSelectedIndex(api.selectedScrollSnap())
        api.on("select", onSelect)
        onSelect()
        return () => {
            api.off("select", onSelect)
        }
    }, [api])

    return { api, setApi, selectedIndex, setSelectedIndex, scrollTo }
}
