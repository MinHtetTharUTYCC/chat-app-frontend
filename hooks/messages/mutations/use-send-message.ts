'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../use-auth-store';
import { messageKeys } from '@/services/messages/messages.keys';
import { chatKeys } from '@/services/chats/chat.keys';
import { sendMessage } from '@/services/messages/message.api';
import { MessageInfiniteData, MessageItem } from '@/types/messages';
import { ChatsListQueryData } from '@/types/chats';
import { toast } from 'sonner';

interface SendMessageVar {
    content: string;
}
interface SendMessageContext {
    prevMessages?: MessageInfiniteData;
    prevChatList?: ChatsListQueryData;
    tempId: string;
}
export function useSendMessage(chatId: string) {
    const queryClient = useQueryClient();
    const { currentUser } = useAuthStore();

    const chatMessagesKey = messageKeys.chat(chatId);
    const chatListKey = chatKeys.all;

    return useMutation<MessageItem, Error, SendMessageVar, SendMessageContext>({
        mutationFn: ({ content }) => sendMessage(chatId, content),
        onMutate: async ({ content }) => {
            if (!currentUser) {
                throw new Error('User must be authenticated before sending messages.');
            }

            //cancel queries
            await Promise.all([
                queryClient.cancelQueries({ queryKey: chatMessagesKey }),
                queryClient.cancelQueries({ queryKey: chatListKey }),
            ]);

            //snapshot prev state
            const prevMessages = queryClient.getQueryData<MessageInfiniteData>(chatMessagesKey);
            const prevChatList = queryClient.getQueryData<ChatsListQueryData>(chatListKey);

            //create optismistic essage
            const tempId = `temp-${Date.now()}-${Math.random()}`;
            const optimisticMessage = {
                id: tempId,
                content,
                chatId,
                senderId: currentUser.id,
                isPinned: false,
                pinnedByUserId: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                sender: {
                    id: currentUser.id,
                    username: currentUser.username,
                },
                _optimistic: true, //UI flag
            };

            //update messages cache
            queryClient.setQueryData<MessageInfiniteData>(chatMessagesKey, (old) => {
                if (!old?.pages) return old;

                const newPages = [...old.pages];
                newPages[0] = {
                    ...newPages[0],
                    messages: [...newPages[0].messages, optimisticMessage],
                };

                return {
                    ...old,
                    pages: newPages,
                };
            });

            //update chat list
            queryClient.setQueryData<ChatsListQueryData>(chatListKey, (old) => {
                if (!old) return old;

                const chatIndex = old.findIndex((chat) => chat.id === optimisticMessage.chatId);

                if (chatIndex === -1) {
                    return old;
                }

                const updatedChat = {
                    ...old[chatIndex],
                    messages: [optimisticMessage],
                    lastMessageAt: optimisticMessage.createdAt,
                };

                const otherChats = old.filter((_, idx) => idx !== chatIndex);

                return [updatedChat, ...otherChats];
            });

            return { prevMessages, prevChatList, tempId };
        },
        onError: (err, _, context) => {
            console.error('Failed to send message');
            toast.error('Failed to send message');

            //rollback
            if (context?.prevMessages) {
                queryClient.setQueryData(chatMessagesKey, context.prevMessages);
            }
            if (context?.prevChatList) {
                queryClient.setQueryData(chatListKey, context.prevChatList);
            }
        },

        onSuccess: (message, content, context) => {
            //replace optimistic with real message
            queryClient.setQueryData<MessageInfiniteData>(chatMessagesKey, (old) => {
                if (!old?.pages) return old;

                const newPages = old.pages.map((page, idx) => {
                    if (idx === 0) {
                        return {
                            ...page,
                            messages: page.messages.map((msg) =>
                                msg.id === context?.tempId ? message : msg
                            ),
                        };
                    }
                    return page;
                });

                return {
                    ...old,
                    pages: newPages,
                };
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: chatMessagesKey });
            queryClient.invalidateQueries({ queryKey: chatListKey });
        },
    });
}
