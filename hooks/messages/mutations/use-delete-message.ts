'use client';

import { chatKeys } from '@/services/chats/chat.keys';
import { deleteMessage, ActionResponse } from '@/services/messages/message.api';
import { messageKeys } from '@/services/messages/messages.keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface DeleteMessageVars {
    messageId: string;
}

interface DeleteMessageContext {
    prevMessages: unknown;
}

export const useDeleteMessage = (chatId: string) => {
    const queryClient = useQueryClient();
    const chatMessagesKey = messageKeys.chat(chatId);
    const chatsListKey = chatKeys.all;

    return useMutation<ActionResponse, Error, DeleteMessageVars, DeleteMessageContext>({
        mutationFn: ({ messageId }) => deleteMessage(chatId, messageId),
        onMutate: async ({ messageId }) => {
            //cancel queries
            await queryClient.cancelQueries({ queryKey: chatMessagesKey });

            //snapshot prev state
            const prevMessages = queryClient.getQueryData(chatMessagesKey);

            //update message cache
            queryClient.setQueryData(chatMessagesKey, (old: any) => {
                if (!old?.pages) return old;

                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        messages: page.messages.filter((msg: any) => msg.id !== messageId),
                    })),
                };
            });

            return { prevMessages };
        },
        onError: (err, _vars, context) => {
            console.error('Failed to delete message:', err);
            toast.error('Failed to delete message');
            if (context?.prevMessages) {
                queryClient.setQueryData(chatMessagesKey, context.prevMessages);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: chatMessagesKey });
            queryClient.invalidateQueries({ queryKey: chatsListKey });
        },
    });
};
