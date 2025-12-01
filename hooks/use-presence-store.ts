import { create } from 'zustand';

interface PresenceState {
    presence: Record<string, { online: boolean; lastSeen: string | null }>;
    updatePresence: (userId: string, online: boolean, lastSeen: string | null) => void;
    bulkUpdatePresence: (
        data: Record<string, { online: boolean; lastSeen: string | null }>
    ) => void;
    getPresence: (userId: string) => { online: boolean; lastSeen: string | null } | null;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
    presence: {},
    updatePresence: (userId, online, lastSeen) => {
        set((state) => ({
            presence: {
                ...state.presence,
                [userId]: { online, lastSeen },
            },
        }));
    },
    bulkUpdatePresence: (data) => {
        set((state) => ({
            presence: {
                ...state.presence,
                ...data,
            },
        }));
    },
    getPresence: (userId) => {
        return get().presence[userId] || null;
    },
}));
