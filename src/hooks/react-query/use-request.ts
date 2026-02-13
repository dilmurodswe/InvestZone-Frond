/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/lib/api/axios-instance"
import { onError } from "@/lib/utils/on-error"
import { QueryClient, useMutation } from "@tanstack/react-query"
import type { AxiosProgressEvent, AxiosRequestConfig } from "axios"
import { useState } from "react"
import type { CustomUseMutationOptions, MutateOpts } from "./types"

type Method = "post" | "put" | "delete" | "patch"
type MutationVariables<P> = {
    url: string
    method: Method
    payload?: P
}

export const useRequest = <P = any, D = any>({
    options,
    config,
    queryClient,
}: {
    options?: CustomUseMutationOptions<D, any, MutationVariables<P>>
    config?: AxiosRequestConfig
    queryClient?: QueryClient
} = {}) => {
    const [uploadProgress, setUploadProgress] = useState(0)
    const mutation = useMutation<D, any, MutationVariables<P>>(
        {
            onError,
            mutationFn: async ({ url, payload, method }) => {
                const res = await axiosInstance({
                    url: `${url}/`,
                    method,
                    data: payload,
                    onUploadProgress: (progressEvent_1: AxiosProgressEvent) => {
                        if (progressEvent_1.total) {
                            const percentCompleted = Math.round(
                                (progressEvent_1.loaded * 100) /
                                    progressEvent_1.total,
                            )
                            setUploadProgress(percentCompleted)
                        }
                    },
                    ...config,
                })
                return res.data
            },
            ...(options || {}),
        },
        queryClient,
    )

    const handleMutate = (
        variables: MutationVariables<P>,
        mutateOptions?: MutateOpts<D, P>,
    ) => {
        mutation.mutate(variables, mutateOptions)
    }
    const handleMutateAsync = (
        variables: MutationVariables<P>,
        mutateOptions?: MutateOpts<D, P>,
    ) => mutation.mutateAsync(variables, mutateOptions)

    const post = (url: string, payload?: P, mutateOptions?: MutateOpts<D, P>) =>
        handleMutate(
            {
                method: "post",
                url,
                payload,
            },
            mutateOptions,
        )

    const postAsync = (
        url: string,
        payload?: P,
        mutateOptions?: MutateOpts<D, P>,
    ) =>
        handleMutateAsync(
            {
                method: "post",
                url,
                payload,
            },
            mutateOptions,
        )

    const put = (url: string, payload?: P, mutateOptions?: MutateOpts<D, P>) =>
        handleMutate(
            {
                method: "put",
                url,
                payload,
            },
            mutateOptions,
        )

    const putAsync = (
        url: string,
        payload?: P,
        mutateOptions?: MutateOpts<D, P>,
    ) =>
        handleMutateAsync(
            {
                method: "put",
                url,
                payload,
            },
            mutateOptions,
        )

    const patch = (
        url: string,
        payload?: P,
        mutateOptions?: MutateOpts<D, P>,
    ) =>
        handleMutate(
            {
                method: "patch",
                url,
                payload,
            },
            mutateOptions,
        )

    const patchAsync = (
        url: string,
        payload?: P,
        mutateOptions?: MutateOpts<D, P>,
    ) =>
        handleMutateAsync(
            {
                method: "patch",
                url,
                payload,
            },
            mutateOptions,
        )

    const remove = (
        url: string,
        payload?: P,
        mutateOptions?: MutateOpts<D, P>,
    ) =>
        handleMutate(
            {
                method: "delete",
                url,
                payload,
            },
            mutateOptions,
        )

    const removeAsync = (
        url: string,
        payload?: P,
        mutateOptions?: MutateOpts<D, P>,
    ) =>
        handleMutateAsync(
            {
                method: "delete",
                url,
                payload,
            },
            mutateOptions,
        )

    return {
        ...mutation,
        uploadProgress,
        post,
        postAsync,
        put,
        putAsync,
        patch,
        patchAsync,
        remove,
        removeAsync,
    }
}
