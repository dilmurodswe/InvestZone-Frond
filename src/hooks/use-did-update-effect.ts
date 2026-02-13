import { useEffect, useRef } from "react"

export default function useDidUpdateEffect(
    callback: () => void,
    dependencies?: React.DependencyList,
) {
    const firstRenderRef = useRef(true)

    useEffect(() => {
        if (firstRenderRef.current) {
            firstRenderRef.current = false
            return
        }
        return callback()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies)
}
