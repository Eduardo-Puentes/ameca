import axios, { AxiosError, type AxiosInstance } from "axios";

type ApiError = {
    message: string;
    status?: number;
    code?: string;
    details?: unknown;
};

function normalizeAxiosError (err : unknown): ApiError {
    if (!axios.isAxiosError(err)) {
        return { message: "Unknown error", details: err };
    }

    const axErr = err as AxiosError<any>;
    return {
        message:
            axErr.response?.data?.message ??
            axErr.response?.data?.detail ??
            axErr.message ??
            "Request failed",
        status: axErr.response?.status,
        code: axErr.code,
        details: axErr.response?.data,
    };
}

function getBaseURL () {
    return process.env.NEXT_PUBLIC_API_URL ?? "";
}

export const api: AxiosInstance = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
    timeout: 20_000,
    headers: {
        Accept: "application/json",
    },

    xsrfCookieName: "csrftoken",
    xsrfHeaderName: "X-CSRFToken", 
});

api.interceptors.request.use((config) => {
    return config;    
});

api.interceptors.response.use(
    (res) => res,
    (err) => Promise.reject(normalizeAxiosError(err))
);