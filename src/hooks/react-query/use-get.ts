/* eslint-disable @typescript-eslint/no-explicit-any */

import { getRequest } from "@/lib/api/default-requests"
import {
    type QueryKey,
    useQuery,
    type UseQueryOptions,
} from "@tanstack/react-query"
import type { AxiosRequestConfig } from "axios"
import { makeQueryKey } from "./make-query-key"

type ICustomUseQueryOptions<TQueryFnData, TError, TData> = Partial<
    UseQueryOptions<TQueryFnData, TError, TData>
>

export type UseGetArgs<TData, TQueryFnData = unknown, TError = any> = {
    deps?: QueryKey
    options?: ICustomUseQueryOptions<TQueryFnData, TError, TData>
    config?: Omit<AxiosRequestConfig, "params">
    params?: Record<string, unknown>
}

export const useGet = <TData, TQueryFnData = unknown, TError = any>(
    url: string,
    args?: UseGetArgs<TData, TQueryFnData, TError>,
) => {
    const { deps, config, options, params } = args || {}

    return useQuery<TQueryFnData, TError, TData>({
        queryKey: (() => {
            return makeQueryKey({ url, deps, params })
        })(),
        queryFn: () => {
            return getRequest(url, {
                ...config,
                params: { ...params },
            })
        },
        ...(options || {}),
    })
}
