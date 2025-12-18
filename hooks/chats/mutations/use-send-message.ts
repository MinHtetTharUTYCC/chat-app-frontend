import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../use-auth-store';
import { api } from '@/lib/api';

export function useSendMessage(chatId: string, setInput: (value: string) => void) {
    const queryClient = useQueryClient();
    const { currentUser } = useAuthStore();

    const query_key_messages = ['messages', chatId];
    const query_key_chat_list = ['chats'];

    return useMutation({
        mutationFn: async (content: string) => {
            return api.post(`/chats/${chatId}/messages`, { content });
        },
        onMutate: async (content: string) => {
            //cancel queries
            await queryClient.cancelQueries({ queryKey: query_key_messages });

            //snapshot prev state
            const prevMessages = queryClient.getQueryData(query_key_messages);

            //create optismistic essage
            const tempId = `temp-${Date.now()}-${Math.random()}`;
            const optimisticMessage = {
                id: tempId,
                content,
                senderId: currentUser?.id,
                chatId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                sender: {
                    id: currentUser?.id,
                    username: currentUser?.username || 'You',
                },
                _optimistic: true, //UI flag
            };

            //update message cache
            queryClient.setQueryData(query_key_messages, (old: any) => {
                if (!old?.pages) return old;

                console.log('OLD:', old);

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
            queryClient.setQueryData(query_key_chat_list, (old: any[]|undefined) => {
                if (!old) return old;

                const chatIndex = old.findIndex((chat: any) => chat.id === optimisticMessage.chatId);

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

            return { prevMessages, tempId };
        },
        onError: (err, content, context) => {
            //rollback
            if (context?.prevMessages) {
                queryClient.setQueryData(query_key_messages, context.prevMessages);
            }
            console.error('Failed to send message: ', err);
        },

        onSuccess: (response: { data: any }, content, context) => {
            //replace optimistic with real message
            queryClient.setQueryData(query_key_messages, (old: any) => {
                if (!old?.pages) return old;

                const newPages = old.pages.map((page: any, idx: number) => {
                    if (idx === 0) {
                        return {
                            ...page,
                            messages: page.messages.map((msg: any) =>
                                msg.id === context?.tempId ? response.data : msg
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
            queryClient.invalidateQueries({ queryKey: query_key_messages });
            queryClient.invalidateQueries({ queryKey: query_key_chat_list });
        },
    });
}
