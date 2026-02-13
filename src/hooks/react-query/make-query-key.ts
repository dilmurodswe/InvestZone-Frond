import type { QueryKey } from "@tanstack/react-query"

interface Args {
    url: string
    deps?: QueryKey
    params?: Record<string, unknown>
}
export function makeQueryKey({ url, deps, params }: Args) {
    const safeDeps = Array.isArray(deps) ? deps : []
    const safeParams =
        typeof params === "object" && params !== null ? params : {}
    const paramValues = Object.values(safeParams).filter(Boolean)
    const key = [url, ...safeDeps, ...paramValues]

    return key
}
