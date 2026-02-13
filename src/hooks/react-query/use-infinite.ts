/* eslint-disable @typescript-eslint/no-explicit-any */
import { getRequest } from "@/lib/api/default-requests"
import { SEARCH_PARAMS } from "@/lib/constants/search-params"
import extractQueryParams from "@/lib/utils/extract-query-params"
import { getArray } from "@/lib/utils/get-array"
import {
    type QueryKey,
    useInfiniteQuery,
    type UseInfiniteQueryOptions,
} from "@tanstack/react-query"
import type { AxiosRequestConfig } from "axios"
import { useEffect } from "react"
import { makeQueryKey } from "./make-query-key"

type ICustomUseInfiniteQueryOptions<TData, TError = any> = Partial<
    UseInfiniteQueryOptions<TQueryFnData<TData>, TError, TData[]>
>

type UseInfiniteArgs<TData, TError = any> = {
    deps?: QueryKey
    options?: ICustomUseInfiniteQueryOptions<TData, TError>
    config?: Omit<AxiosRequestConfig, "params">
    params?: Record<string, unknown>
    cursorKey?: typeof SEARCH_PARAMS.PAGE | typeof SEARCH_PARAMS.OFFSET
}
type TQueryFnData<TData> = {
    count: number
    next: string | null
    previous: string | null
    results: TData[]
}
export const useInfinite = <TData, TError = any>(
    url: string,
    args?: UseInfiniteArgs<TData, TError>,
) => {
    const {
        deps,
        options,
        config,
        params,
        cursorKey = SEARCH_PARAMS.PAGE,
    } = args || {}
    const res = useInfiniteQuery<TQueryFnData<TData>, TError, TData[]>({
        queryKey: (() => {
            const key = makeQueryKey({ url, deps, params })
            return [...key, "infinite"]
        })(),
        queryFn: ({ pageParam }) => {
            return getRequest(url, {
                ...config,
                params: {
                    [cursorKey]: pageParam,
                    limit: cursorKey === "offset" ? 10 : undefined,
                    [SEARCH_PARAMS.PAGE_SIZE]:
                        cursorKey === SEARCH_PARAMS.PAGE ? 10 : undefined,
                    ...params,
                },
            })
        },
        getNextPageParam: (lastPage) => {
            return lastPage.next ?
                    extractQueryParams(lastPage.next)[cursorKey]
                :   undefined
        },
        initialPageParam: undefined,
        initialData: { pages: [], pageParams: [] },
        select: ({ pages }) => pages.flatMap((p) => getArray(p.results)),
        retry: false,
        refetchOnMount: true,
        ...(options || {}),
    })
    const r = res
    useEffect(() => {
        res.fetchNextPage()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return { ...r, data: r.data! }
}
