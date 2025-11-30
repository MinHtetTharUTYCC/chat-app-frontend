import { useAuthStore } from "@/hooks/use-auth-store";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000";

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// --- REQUEST INTERCEPTOR ---
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// --- RESPONSE INTERCEPTOR (401 HANDLER) ---
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        // Only refresh on 401
        if (error.response?.status !== 401) throw error;

        // Do NOT retry refresh request itself
        if (originalRequest.url.includes("/auth/refresh")) {
            useAuthStore.getState().logout();
            // window.location.href = "/login";
            return Promise.reject(error);
        }

        // Start one refresh only
        if (!isRefreshing) {
            isRefreshing = true;

            refreshPromise = api.post("/auth/refresh")
                .then((res) => {
                    const newToken = res.data.accessToken;
                    useAuthStore.getState().setAccessToken(newToken);
                    return newToken;
                })
                .finally(() => (isRefreshing = false));
        }

        // Wait for refresh to finish
        const newToken = await refreshPromise;

        // Retry original request
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return api.request(originalRequest);
    }
);

export const fetcher = (url: string) => api.get(url).then((res) => res.data);
