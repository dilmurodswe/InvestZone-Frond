/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    deleteRequest,
    patchRequest,
    postRequest,
    putRequest,
} from "@/lib/api/default-requests"
import { onError } from "@/lib/utils/on-error"
import { useMutation } from "@tanstack/react-query"
import type { AxiosRequestConfig } from "axios"
import type {
    MutateOpts,
    MutationVariables,
    RequestFunction,
    UseMutationOpts,
} from "./types"

const createMutationHook = <P = any, D = any>(requestFn: RequestFunction) => {
    return (options?: UseMutationOpts<D, P>, config?: AxiosRequestConfig) => {
        const mutation = useMutation<D, any, MutationVariables<P>>({
            mutationFn: ({ url, payload }) => {
                return requestFn(url, payload, config)
            },
            onError,
            ...(options || {}),
        })

        const mutate = (
            url: string,
            payload?: P,
            mutateOptions?: MutateOpts<D, P>,
        ) => {
            mutation.mutate({ url, payload }, mutateOptions)
        }

        const mutateAsync = (
            url: string,
            payload?: P,
            mutateOptions?: MutateOpts<D, P>,
        ) => mutation.mutateAsync({ url, payload }, mutateOptions)

        return { ...mutation, mutate, mutateAsync }
    }
}

// Mutation hooks
// eslint-disable-next-line react-x/no-unnecessary-use-prefix
export const usePost = <P = any, D = any>(
    options?: UseMutationOpts<D, P>,
    config?: AxiosRequestConfig,
) => createMutationHook<P, D>(postRequest)(options, config)

// eslint-disable-next-line react-x/no-unnecessary-use-prefix
export const usePut = <P = any, D = any>(
    options?: UseMutationOpts<D, P>,
    config?: AxiosRequestConfig,
) => createMutationHook<P, D>(putRequest)(options, config)

// eslint-disable-next-line react-x/no-unnecessary-use-prefix
export const usePatch = <P = any, D = any>(
    options?: UseMutationOpts<D, P>,
    config?: AxiosRequestConfig,
) => createMutationHook<P, D>(patchRequest)(options, config)

// eslint-disable-next-line react-x/no-unnecessary-use-prefix
export const useDelete = <P = any, D = any>(
    options?: UseMutationOpts<D, P>,
    config?: AxiosRequestConfig,
) => createMutationHook<P, D>(deleteRequest)(options, config)
