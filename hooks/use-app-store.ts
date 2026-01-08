import { create } from 'zustand';

interface AppState {
    isChatsOpen: boolean;
    setChatsOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
    currentUser: null,
    isChatsOpen: true,
    setChatsOpen: (open) => set({ isChatsOpen: open }),
}));
