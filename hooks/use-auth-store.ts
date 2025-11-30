import { create } from "zustand";

interface User {
    id: string;
    username: string;
    email: string;
}

interface AuthState {
    accessToken: string | null;
    currentUser: User | null;
    setAccessToken: (token: string | null) => void;
    setCurrentUser: (user: AuthState["currentUser"]) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    currentUser: null,
    setAccessToken: (token) => set({ accessToken: token }),
    setCurrentUser: (user) => set({ currentUser: user }),
    logout: () => set({ accessToken: null, currentUser: null }),
}));