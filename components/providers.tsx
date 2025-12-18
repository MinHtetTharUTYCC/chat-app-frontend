'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { useAuthStore } from '@/hooks/use-auth-store';
import { api } from '@/lib/api';
import { useSocketStore } from '@/hooks/use-socket-store';
import { useRouter } from 'next/navigation';
import { useActiveChat } from '@/hooks/params/use-active-chat';
import { shouldShowMessageToast, shouldShowTitleUpdateToast } from '@/lib/chat/toast-rules';
import { useAppStore } from '@/hooks/use-app-store';
import { ChatItemResponse } from '@/types/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    const activeChatId = useActiveChat();
    const activeChatIdRef = useRef<string | null>(activeChatId);

    const { socket, setSocket } = useSocketStore();
    const { accessToken, currentUser, setCurrentUser } = useAuthStore();
    const { setChatsOpen } = useAppStore();

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

        const handleNewMessage = async (newMessage: any) => {
            const shouldShowToast = shouldShowMessageToast({
                activeChatId: activeChatIdRef.current,
                messageChatId: newMessage.chatId,
                senderId: newMessage.senderId,
                currentUserId: currentUser.id,
            });

            if (shouldShowToast) {
                toast('New Message', {
                    description: `${newMessage.sender.username}: ${newMessage.content}`,
                    action: {
                        label: 'View',
                        onClick: () => {
                            setChatsOpen(false);
                            router.push(`/chats/${newMessage.chatId}`);
                        },
                    },
                });
            }

            // ignore messages sent by me(already updated optimistically at sender side)
            if (newMessage.senderId === currentUser.id) return;

            //update chatsList
            queryClient.setQueryData(['chats'], (old: any[] | undefined) => {
                if (!old) return old;

                const chatIndex = old.findIndex((chat: any) => chat.id === newMessage.chatId);

                if (chatIndex === -1) {
                    return old;
                }

                const updatedChat = {
                    ...old[chatIndex],
                    messages: [newMessage],
                    lastMessageAt: newMessage.createdAt,
                };

                const otherChats = old.filter((_, idx) => idx !== chatIndex);

                return [updatedChat, ...otherChats];
            });

            //update chat
            queryClient.setQueryData(['messages', newMessage.chatId], (oldData: any) => {
                if (!oldData) return oldData;

                const firstPage = oldData.pages[0];
                const updatedFirstPage = {
                    ...firstPage,
                    messages: [newMessage, ...firstPage.messages],
                };
                return {
                    ...oldData,
                    pages: [updatedFirstPage, ...oldData.pages.slice(1)],
                };
            });
        };

        const handleTitleUpdate = async (details: any) => {
            const showToast = shouldShowTitleUpdateToast({
                activeChatId: activeChatIdRef.current,
                titleChatId: details.chatId,
                senderId: details.updatedById,
                currentUserId: currentUser.id,
            });
            if (showToast) {
                toast('Group Name Update', {
                    description: `${details.username} changed group name to ${details.newTitle}`,
                    action: {
                        label: 'View',
                        onClick: () => {
                            router.push(`/chats/${details.chatId}`);
                            setChatsOpen(false);
                        },
                    },
                });
            }

            // ignore my own updates (already handled optimistically while updating)
            if (details.updatedById === currentUser.id) return;

            //update queries
            queryClient.setQueryData(['chats'], (old: any) => {
                if (!old) return old;

                return old.map((chat: any) =>
                    chat.id === details.chatId ? { ...chat, title: details.newTitle } : chat
                );
            });
            queryClient.setQueryData(['chat', details.chatId], (old: any) => {
                if (!old) return old;

                return { ...old, title: details.newTitle };
            });
        };

        const handleGroupAdded = async (groupChat: ChatItemResponse) => {
            toast('New Group', {
                description: `You are added to a new group${
                    groupChat.title ? `: ${groupChat.title}` : ''
                }`,
                action: {
                    label: 'View',
                    onClick: () => {
                        setChatsOpen(false);
                        router.push(`/chats/${groupChat.id}`);
                    },
                },
            });

            queryClient.setQueryData(['chats'], (old: ChatItemResponse[] | undefined) => {
                if (!old) return old;

                return [groupChat, ...old];
            });
        };

        newSocket.on('connect', hanldeJoinRooms);
        newSocket.on('title_update', handleTitleUpdate);
        newSocket.on('new_message', handleNewMessage);
        newSocket.on('group_added', handleGroupAdded);
        newSocket.on('disconnect', () => {
            console.log('WS Disconnected');
        });

        setSocket(newSocket);

        return () => {
            newSocket.off('connect', hanldeJoinRooms);
            newSocket.off('title_update', handleTitleUpdate);
            newSocket.off('new_message', handleNewMessage);
            newSocket.on('group_added', handleGroupAdded);
            newSocket.off('disconnect');
            newSocket.close();
        };
    }, [currentUser, accessToken]);

    useEffect(() => {
        activeChatIdRef.current = activeChatId;
    }, [activeChatId]);

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <QueryClientProvider client={queryClient}>
                {children}
                <Toaster />
            </QueryClientProvider>
        </ThemeProvider>
    );
}
