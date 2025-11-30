import { Socket } from "socket.io-client";
import { create } from "zustand";

interface SocketState {
    socket: Socket | null;
    setSocket: (socket: Socket) => void;
}

export const useSocketStore = create<SocketState>(set => ({
    socket: null,
    setSocket: (socket) => set({ socket }),
}));