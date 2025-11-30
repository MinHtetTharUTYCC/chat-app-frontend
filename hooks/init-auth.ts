import { api } from "@/lib/api";
import { useAuthStore } from "./use-auth-store";

export const initAuth = async () => {
    try {
        const res = await api.post('/auth/refresh');
        const { accessToken, user } = res.data;
        useAuthStore.getState().setAccessToken(accessToken);
        useAuthStore.getState().setCurrentUser(user);
    }
    catch (error) {
        console.error('Auth initialization failed', error);
    }
}