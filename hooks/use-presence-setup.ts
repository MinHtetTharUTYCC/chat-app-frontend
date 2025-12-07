'use client';
import { useEffect } from 'react';
import { useAuthStore } from './use-auth-store';
import { usePresenceStore } from './use-presence-store';
import { useSocketStore } from './use-socket-store';

export function usePresenceSetup() {
    const { socket } = useSocketStore();
    const { currentUser } = useAuthStore();
    const updatePresence = usePresenceStore((state) => state.updatePresence);

    useEffect(() => {
        if (!socket || !currentUser) {
            console.log('unable to connect', socket);
            return;
        } else {
            console.log('connected.......', socket);
            socket.emit('user_online');
        }

        // ✅ SET USER ONLINE when socket connects
        const handleConnect = () => {
            console.log('Socket connected, setting user online');
            socket.emit('user_online');
        };

        // SET USER OFFLINE when socket disconnects
        const handleDisconnect = () => {
            console.log('Socket disconnected, setting user offline');
            socket.emit('user_offline');
        };

        // LISTEN for presence updates from other users
        const handlePresenceUpdate = (data: {
            userId: string;
            online: boolean;
            lastSeen: string | null;
        }) => {
            if (data.userId !== currentUser?.id) {
                console.log('Presence update received:::::', data);
                updatePresence(data.userId, data.online, data.lastSeen);
            }
        };

        // If already connected, set online immediately
        if (socket.connected) {
            console.log('emiting user online', socket);
            socket.emit('user_online');
        }

        // Register event listeners
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('presence_update', handlePresenceUpdate);

        // ✅ HEARTBEAT to keep connection alive
        const heartbeatInterval = setInterval(() => {
            if (socket.connected) {
                socket.emit('heartbeat');
            }
        }, 30 * 1000); // Every 30 seconds

        // ✅ HANDLE PAGE VISIBILITY (tab switching)
        const handleVisibilityChange = () => {
            if (!socket.connected) return;

            if (document.hidden) {
                // socket.emit('user_away');
                socket.emit('user_offline');
            } else {
                socket.emit('user_online');
            }
        };

        // ✅ HANDLE PAGE CLOSE/REFRESH
        const handleBeforeUnload = () => {
            socket.emit('user_offline');
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup
        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('presence_update', handlePresenceUpdate);
            clearInterval(heartbeatInterval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('beforeunload', handleBeforeUnload);

            // set offline on unmount
            socket.emit('user_offline');
        };
    }, [socket, currentUser, updatePresence]);
}
