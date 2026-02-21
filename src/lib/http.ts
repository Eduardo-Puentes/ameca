import type { AxiosRequestConfig } from "axios";
import { api } from "./AxiosClient";

export async function getJSON<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await api.get<T>(url, config);
    return res.data;
}

export async function postJSON<TResponse, TBody>(
    url: string,
    body: TBody,
    config?: AxiosRequestConfig
): Promise<TResponse> {
    const res = await api.post<TResponse>(url, body, {
        ...config,
        headers: {
        "Content-Type": "application/json",
        ...(config?.headers ?? {}),
        },
    });
    return res.data;
}

export async function postForm<TResponse>(
    url: string,
    form: FormData,
    config?: AxiosRequestConfig
): Promise<TResponse> {
    const res = await api.post<TResponse>(url, form, {
        ...config,
        headers: {
        ...(config?.headers ?? {}),
        },
    });
    return res.data;
}