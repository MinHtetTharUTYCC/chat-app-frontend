'use client';

import { chatKeys } from '@/services/chats/chat.keys';
import { deleteMessage } from '@/services/messages/message.api';
import { messageKeys } from '@/services/messages/messages.keys';
import { DeleteMessageResponse } from '@/types/actions';
import { MessageInfiniteData } from '@/types/messages';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface DeleteMessageVars {
    messageId: string;
}

interface DeleteMessageContext {
    prevMessages?: MessageInfiniteData;
}

export const useDeleteMessage = (chatId: string) => {
    const queryClient = useQueryClient();
    const chatMessagesKey = messageKeys.chat(chatId);
    const chatsListKey = chatKeys.all;

    return useMutation<DeleteMessageResponse, Error, DeleteMessageVars, DeleteMessageContext>({
        mutationFn: ({ messageId }) => deleteMessage(chatId, messageId),
        onMutate: async ({ messageId }) => {
            //cancel queries
            await queryClient.cancelQueries({ queryKey: chatMessagesKey });

            //ignore chats list last message (for now)
            //snapshot prev state
            const prevMessages = queryClient.getQueryData<MessageInfiniteData>(chatMessagesKey);

            //optimistic update
            queryClient.setQueryData<MessageInfiniteData>(chatMessagesKey, (old) => {
                if (!old?.pages) return old;

                return {
                    ...old,
                    pages: old.pages.map((page) => ({
                        ...page,
                        messages: page.messages.filter((msg) => msg.id !== messageId),
                    })),
                };
            });

            return { prevMessages };
        },
        onError: (err, _, context) => {
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
