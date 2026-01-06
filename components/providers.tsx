'use client';

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
import { MessageInfiniteData, MessageItem } from '@/types/messages';
import {
    NewChatReceiver,
    MessageEditedReceiver,
    PinAddedReceiver,
    GroupAddedReceiver,
    TitleUpdateReceiver,
    UserJoinedGroupReceiver,
    UserLeftGroupReceiver,
    MembersAddedReceiver,
    GroupInvitedReceiver,
} from '@/types/receivers';
import { chatKeys } from '@/services/chats/chat.keys';
import { messageKeys, pinnedKeys } from '@/services/messages/messages.keys';
import { notificationKeys } from '@/services/noti/noti.keys';
import { ChatDetailsQueryData, ChatsListQueryData } from '@/types/chats';
import { getErrorMessage } from '@/lib/error-handler';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const queryClient = new QueryClient({
    //for actions(POST, PUT, DELETE)
    mutationCache: new MutationCache({
        onError: (error, _variables, _context, mutation) => {
            // if mutation has its own onError, skip global one
            if (mutation.options.onError) return;

            const msg = getErrorMessage(error);
            toast.error(msg);
        },
    }),
    // Global error handler for Queries(GET)
    queryCache: new QueryCache({
        onError: (error) => {
            const msg = getErrorMessage(error);
            toast.error(`Error loading data: ${msg}`);
        },
    }),
    defaultOptions: {
        queries: {
            retry: 1, //don't retry infinitely on error
            refetchOnWindowFocus: false,
        },
    },
});

export function Providers({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    const activeChatId = useActiveChat();
    const activeChatIdRef = useRef<string | null>(activeChatId);

    const { socket, setSocket } = useSocketStore();
    const { accessToken, currentUser, setCurrentUser } = useAuthStore();
    const { setChatsOpen } = useAppStore();

    // 1. Load user ONCE on page load
    useEffect(() => {
        if (!accessToken) return;

        async function loadUser() {
            try {
                const res = await api.get('/users/me');
                setCurrentUser(res.data);
            } catch {}
        }

        loadUser();
    }, [accessToken, setCurrentUser]);

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

        const handleNewMessage = async (newMessage: MessageItem) => {
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
            queryClient.setQueryData<ChatsListQueryData>(chatKeys.all, (old) => {
                if (!old) return old;

                const chatIndex = old.findIndex((chat) => chat.id === newMessage.chatId);

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
            queryClient.setQueryData<MessageInfiniteData>(
                ['messages', newMessage.chatId],
                (oldData) => {
                    if (!oldData) return oldData;

                    const firstPage = oldData.pages[0];
                    const updatedFirstPage = {
                        ...firstPage,
                        messages: [...firstPage.messages, newMessage],
                    };
                    return {
                        ...oldData,
                        pages: [updatedFirstPage, ...oldData.pages.slice(1)],
                    };
                }
            );
        };

        const handleEditMessage = async (editedMessage: MessageEditedReceiver) => {
            // ignore messages edited by me(already updated optimistically while sending)
            if (editedMessage.actor.id === currentUser.id) return;

            //sidebar list
            queryClient.invalidateQueries({ queryKey: chatKeys.all });

            // chat messages
            let found = false;
            queryClient.setQueryData<MessageInfiniteData>(
                messageKeys.chat(editedMessage.chatId),
                (oldData) => {
                    if (!oldData) return undefined;

                    return {
                        ...oldData,
                        pages: oldData.pages.map((page) => {
                            if (found) return page; //skip the rest

                            const newMessages = page.messages.map((msg) => {
                                if (msg.id === editedMessage.messageId) {
                                    found = true;
                                    return { ...msg, content: editedMessage.content };
                                }

                                return msg;
                            });

                            return { ...page, messages: newMessages };
                        }),
                    };
                }
            );
        };

        const handleTitleUpdate = async (titleUpdate: TitleUpdateReceiver) => {
            const showToast = shouldShowTitleUpdateToast({
                activeChatId: activeChatIdRef.current,
                titleChatId: titleUpdate.chatId,
                senderId: titleUpdate.actor.id,
                currentUserId: currentUser.id,
            });
            if (showToast) {
                toast('Group Name Update', {
                    description: `${titleUpdate.actor.username} changed group name to ${titleUpdate.newTitle}`,
                    action: {
                        label: 'View',
                        onClick: () => {
                            router.push(`/chats/${titleUpdate.chatId}`);
                            setChatsOpen(false);
                        },
                    },
                });
            }

            // ignore my own updates (already handled optimistically while updating)
            if (titleUpdate.actor.id === currentUser.id) return;

            //update queries
            queryClient.setQueryData<ChatsListQueryData>(chatKeys.all, (old) => {
                if (!old) return old;

                return old.map((chat) =>
                    chat.id === titleUpdate.chatId ? { ...chat, title: titleUpdate.newTitle } : chat
                );
            });
            queryClient.setQueryData<ChatDetailsQueryData>(
                chatKeys.chat(titleUpdate.chatId),
                (old) => {
                    if (!old) return old;

                    return { ...old, title: titleUpdate.newTitle };
                }
            );
        };

        const handleGroupAdded = async (newGroup: GroupAddedReceiver) => {
            toast('New Group', {
                description: `${newGroup.user.username} added you to ${newGroup.title}`,
                action: {
                    label: 'View',
                    onClick: () => {
                        setChatsOpen(false);
                        router.push(`/chats/${newGroup.chatId}`);
                    },
                },
            });

            queryClient.invalidateQueries({ queryKey: chatKeys.all });
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        };

        const handleGroupInvited = async (newGroup: GroupInvitedReceiver) => {
            toast('Group Invited', {
                description: `${newGroup.user.username} invited you to join ${newGroup.title}`,
                action: {
                    label: 'View',
                    onClick: () => {
                        setChatsOpen(false);
                        router.push(`/chats/${newGroup.chatId}`);
                    },
                },
            });

            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        };

        const handleUserJoinedGroup = async (group: UserJoinedGroupReceiver) => {
            if (group.user.id === currentUser.id) return;

            toast('New Member', {
                description: `${group.user.username} joined ${group.title}`,
                action: {
                    label: 'View',
                    onClick: () => router.push(`/chats/${group.chatId}`),
                },
            });

            queryClient.invalidateQueries({ queryKey: chatKeys.chat(group.chatId) });
            queryClient.invalidateQueries({ queryKey: chatKeys.all });
        };

        const handleUserLeftGroup = async (group: UserLeftGroupReceiver) => {
            if (group.user.id === currentUser.id) return;

            toast('Member Left', {
                description: `${group.user.username} left ${group.title}`,
                action: {
                    label: 'View',
                    onClick: () => router.push(`/chats/${group.chatId}`),
                },
            });

            queryClient.invalidateQueries({ queryKey: chatKeys.chat(group.chatId) });
            queryClient.invalidateQueries({ queryKey: chatKeys.all });
        };

        const handleMembersAddedToGroup = async (added: MembersAddedReceiver) => {
            if (added.user.id === currentUser.id) return;

            toast('New Members', {
                description: `${added.user.username} added ${added.addedMembersCount} ${
                    added.addedMembersCount > 1 ? ' members' : ' member'
                } to ${added.title}`,
                action: {
                    label: 'View',
                    onClick: () => router.push(`/chats/${added.chatId}`),
                },
            });

            queryClient.invalidateQueries({ queryKey: chatKeys.all });
            queryClient.invalidateQueries({ queryKey: chatKeys.chat(added.chatId) });
        };

        const handleNewChat = async (newChat: NewChatReceiver) => {
            toast('New Chat', {
                description: `${newChat.starter.username} started a new chat`,
                action: {
                    label: 'View',
                    onClick: () => {
                        setChatsOpen(false);
                        router.push(`/chats/${newChat.chatId}`);
                    },
                },
            });

            queryClient.invalidateQueries({ queryKey: chatKeys.all });
        };

        const handlePinAdded = async (pinned: PinAddedReceiver) => {
            // skip mine
            if (pinned.actor.id === currentUser.id) {
                return;
            }

            toast('Pinned', {
                description: `${pinned.actor.username} pinned your message`,
                action: {
                    label: 'View',
                    onClick: () => {
                        setChatsOpen(false);
                        router.push(`/chats/${pinned.chatId}?messageId=${pinned.messageId}`);
                    },
                },
            });

            // notifications
            queryClient.refetchQueries({
                queryKey: notificationKeys.all,
                exact: false,
                type: 'all',
            });

            //pinned
            queryClient.invalidateQueries({
                queryKey: pinnedKeys.chat(pinned.chatId),
            });
        };

        newSocket.on('connect', hanldeJoinRooms);
        newSocket.on('title_update', handleTitleUpdate);
        newSocket.on('new_message', handleNewMessage);
        newSocket.on('message_edited', handleEditMessage);
        newSocket.on('new_chat', handleNewChat);
        newSocket.on('group_added', handleGroupAdded);
        newSocket.on('group_invited', handleGroupInvited);
        newSocket.on('user_joined_group', handleUserJoinedGroup);
        newSocket.on('user_left_group', handleUserLeftGroup);
        newSocket.on('members_added', handleMembersAddedToGroup);
        newSocket.on('pin_added', handlePinAdded);

        newSocket.on('disconnect', () => {
            console.log('WS Disconnected');
        });

        setSocket(newSocket);

        return () => {
            newSocket.off('connect', hanldeJoinRooms);
            newSocket.off('title_update', handleTitleUpdate);
            newSocket.off('new_message', handleNewMessage);
            newSocket.off('message_edited', handleEditMessage);
            newSocket.off('new_chat', handleNewChat);
            newSocket.off('group_added', handleGroupAdded);
            newSocket.off('group_invited', handleGroupInvited);
            newSocket.off('user_joined_group', handleUserJoinedGroup);
            newSocket.off('user_left_group', handleUserLeftGroup);
            newSocket.off('members_added', handleMembersAddedToGroup);
            newSocket.off('pin_added', handlePinAdded);
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
