import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../use-auth-store';
import { messageKeys } from '@/services/messages/messages.keys';
import { chatKeys } from '@/services/chats/chat.keys';
import { sendMessage } from '@/services/messages/message.api';
import { MessageItem } from '@/types/types';

interface SendMessageVar {
    content: string;
}
interface SendMessageContext {
    prevMessages: unknown;
    prevChatList: unknown;
    tempId: string;
}
export function useSendMessage(chatId: string, setInput: (value: string) => void) {
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
            await queryClient.cancelQueries({ queryKey: chatMessagesKey });

            //snapshot prev state
            const prevMessages = queryClient.getQueryData(chatMessagesKey);
            const prevChatList = queryClient.getQueryData(chatListKey);

            //create optismistic essage
            const tempId = `temp-${Date.now()}-${Math.random()}`;
            const optimisticMessage = {
                id: tempId,
                content,
                senderId: currentUser.id,
                chatId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                sender: {
                    id: currentUser.id,
                    username: currentUser.username || 'You',
                },
                _optimistic: true, //UI flag
            };

            //update message cache
            queryClient.setQueryData(chatMessagesKey, (old: any) => {
                if (!old?.pages) return old;

                const newPages = [...old.pages];
                newPages[0] = {
                    ...newPages[0],
                    messages: [optimisticMessage, ...newPages[0].messages],
                };

                return {
                    ...old,
                    pages: newPages,
                };
            });

            //update chat list
            queryClient.setQueryData(chatListKey, (old: any[] | undefined) => {
                if (!old) return old;

                const chatIndex = old.findIndex(
                    (chat: any) => chat.id === optimisticMessage.chatId
                );

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

            // clear input
            setInput('');

            return { prevMessages, prevChatList, tempId };
        },
        onError: (err, content, context) => {
            //rollback
            if (context?.prevMessages) {
                queryClient.setQueryData(chatMessagesKey, context.prevMessages);
            }
            if (context?.prevChatList) {
                queryClient.setQueryData(chatListKey, context.prevChatList);
            }
            console.error('Failed to send message: ', err);
        },

        onSuccess: (message, content, context) => {
            //replace optimistic with real message
            queryClient.setQueryData(chatMessagesKey, (old: any) => {
                if (!old?.pages) return old;

                const newPages = old.pages.map((page: any, idx: number) => {
                    if (idx === 0) {
                        return {
                            ...page,
                            messages: page.messages.map((msg: any) =>
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
            //Ensure Everyting is in sync
            queryClient.invalidateQueries({ queryKey: chatMessagesKey });
            queryClient.invalidateQueries({ queryKey: chatListKey });
        },
    });
}
