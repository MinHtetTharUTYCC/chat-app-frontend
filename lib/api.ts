import { useAuthStore } from '@/hooks/use-auth-store';
import { refresh } from '@/services/auth/auth.api';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

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
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // do not refresh if refresh itself failed
        if (originalRequest.url.includes('/auth/refresh')) {
            useAuthStore.getState().logout();
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        // one refresh only
        try {
            if (!isRefreshing) {
                isRefreshing = true;

                refreshPromise = refresh()
                    .then(({ accessToken }) => {
                        useAuthStore.getState().setAccessToken(accessToken);
                        return accessToken;
                    })
                    .finally(() => (isRefreshing = false));
            }

            // Wait for refresh to finish
            const newToken = await refreshPromise;

            // retry original request
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            useAuthStore.getState().logout();
            return Promise.reject(refreshError);
        }
    }
);

export const fetcher = (url: string) => api.get(url).then((res) => res.data);
