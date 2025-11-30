'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { useAuthStore } from '@/hooks/use-auth-store';
import { api } from '@/lib/api';
import { useSocketStore } from '@/hooks/use-socket-store';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    const { socket, setSocket } = useSocketStore();
    const { accessToken, currentUser, setCurrentUser } = useAuthStore();

    // 1. Load user ONCE on page load
    useEffect(() => {
        async function loadUser() {
            try {
                const res = await api.get('/users/me');
                setCurrentUser(res.data);
            } catch {}
        }

        loadUser();
    }, []);

    // 2. Connect socket only AFTER user exists
    useEffect(() => {
        if (!currentUser) {
            return () => {};
        }

        const newSocket = io(BACKEND_URL, {
            auth: {
                token: accessToken,
            },
            transports: ['websocket'],
        });

        const hanldeJoinRooms = async () => {
            console.log('WS Connected.');
            try {
                const res = await api.get(`/chats/my-chats-ids`);
                const chatsId = res.data;

                //join persnal room
                newSocket.emit('join_user', `user_${currentUser.id}`);

                //join chat rooms
                chatsId.forEach((chatId: string) => {
                    socket?.emit('join_chat', `chat_${chatId}`);
                });

                console.log('Joininged chat rooms:', chatsId);
            } catch (error) {
                console.error('Failed to join rooms', error);
            }
        };

        newSocket.on('connect', hanldeJoinRooms);

        newSocket.on('new_message', (data) => {
            console.log('new_message via WS:', data);
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            // queryClient.invalidateQueries({ queryKey: ['messages', data.chatId] });
        });

        newSocket.on('notification', (data) => {
            queryClient.invalidateQueries({ queryKey: ['chats'] });

            toast(data.title || 'New Notification', {
                description: data.message,
                action: {
                    label: 'View',
                    onClick: () => console.log('Navigate to', data.chatId),
                },
            });
        });

        newSocket.on('disconnect', () => {
            console.log('WS Disconnected');
        });

        setSocket(newSocket);

        return () => {
            newSocket.off('connect', hanldeJoinRooms);
            newSocket.off('disconnect');
            newSocket.off('new_message');
            newSocket.off('notification');
            newSocket.close();
        };
    }, [currentUser, accessToken]);

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <QueryClientProvider client={queryClient}>
                {children}
                <Toaster />
            </QueryClientProvider>
        </ThemeProvider>
    );
}
