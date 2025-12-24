'use client';

import { chatKeys } from '@/services/chats/chat.keys';
import { editMessage } from '@/services/messages/message.api';
import { messageKeys } from '@/services/messages/messages.keys';
import { MessageItem } from '@/types/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface EditMessageVars {
    messageId: string;
    content: string;
}

interface EditMessageContext {
    prevMessages: unknown;
}

export const useEditMessage = (chatId: string, setEditOpen: (open: boolean) => void) => {
    const queryClient = useQueryClient();
    const chatMessagesKey = messageKeys.chat(chatId);
    const chatsListKey = chatKeys.all;

    return useMutation<MessageItem, Error, EditMessageVars, EditMessageContext>({
        mutationFn: ({ messageId, content }) => editMessage(chatId, messageId, content),
        onMutate: async ({ messageId, content }) => {
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
                        messages: page.messages.map((msg: any) =>
                            msg.id === messageId
                                ? {
                                      ...msg,
                                      content,
                                      updatedAt: new Date().toISOString(),
                                      _optimistic: true,
                                  }
                                : msg
                        ),
                    })),
                };
            });

            setEditOpen(false);

            return { prevMessages };
        },
        onError: (err, _vars, context) => {
            console.error('Failed to edit message:', err);
            toast.error('Failed to edit message');
            if (context?.prevMessages) {
                queryClient.setQueryData(chatMessagesKey, context.prevMessages);
            }
        },
        onSuccess: (updatedMessage) => {
            queryClient.setQueryData(chatMessagesKey, (old: any) => {
                if (!old?.pages) return old;

                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        messages: page.messages.map((msg: any) =>
                            msg.id === updatedMessage.id ? updatedMessage : msg
                        ),
                    })),
                };
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: chatMessagesKey });
            queryClient.invalidateQueries({ queryKey: chatsListKey });
        },
    });
};
