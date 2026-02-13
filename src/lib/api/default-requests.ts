import type { AxiosRequestConfig } from "axios"
import axiosInstance from "./axios-instance"

export const getRequest = (url: string, config?: AxiosRequestConfig) =>
    axiosInstance.get(`${url}/`, config).then((res) => res.data)

export const postRequest = <T>(
    url: string,
    payload: T,
    config?: AxiosRequestConfig,
) => axiosInstance.post(`${url}/`, payload, config).then((res) => res.data)

export const putRequest = <T>(
    url: string,
    payload: T,
    config?: AxiosRequestConfig,
) => axiosInstance.put(`${url}/`, payload, config).then((res) => res.data)

export const patchRequest = <T>(
    url: string,
    payload: T,
    config?: AxiosRequestConfig,
) => axiosInstance.patch(`${url}/`, payload, config).then((res) => res.data)

export const deleteRequest = <T>(
    url: string,
    payload?: T,
    config?: AxiosRequestConfig,
) =>
    axiosInstance
        .delete(`${url}/`, { ...config, data: payload })
        .then((res) => res.data)

export const axiosRequest = () => axiosInstance({})
