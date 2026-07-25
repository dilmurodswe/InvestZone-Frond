import type { AxiosRequestConfig } from "axios"
import axiosInstance from "./axios-instance"

/**
 * Exactly one trailing slash — the API wants it, but a caller that builds a
 * URL from an empty id (`orders/{id}` → `orders/`) would otherwise produce
 * `orders//`, which the backend 404s. Collapse any trailing slashes first.
 */
const withSlash = (url: string) => `${url.replace(/\/+$/, "")}/`

export const getRequest = (url: string, config?: AxiosRequestConfig) =>
    axiosInstance.get(withSlash(url), config).then((res) => res.data)

export const postRequest = <T>(
    url: string,
    payload: T,
    config?: AxiosRequestConfig,
) => axiosInstance.post(withSlash(url), payload, config).then((res) => res.data)

export const putRequest = <T>(
    url: string,
    payload: T,
    config?: AxiosRequestConfig,
) => axiosInstance.put(withSlash(url), payload, config).then((res) => res.data)

export const patchRequest = <T>(
    url: string,
    payload: T,
    config?: AxiosRequestConfig,
) => axiosInstance.patch(withSlash(url), payload, config).then((res) => res.data)

export const deleteRequest = <T>(
    url: string,
    payload?: T,
    config?: AxiosRequestConfig,
) =>
    axiosInstance
        .delete(withSlash(url), { ...config, data: payload })
        .then((res) => res.data)

export const axiosRequest = () => axiosInstance({})
