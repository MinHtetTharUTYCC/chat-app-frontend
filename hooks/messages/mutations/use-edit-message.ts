'use client';

import { chatKeys } from '@/services/chats/chat.keys';
import { editMessage } from '@/services/messages/message.api';
import { messageKeys } from '@/services/messages/messages.keys';
import { EditMessageResponse } from '@/types/actions';
import { MessageInfiniteData } from '@/types/messages';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface EditMessageVars {
    messageId: string;
    content: string;
}

interface EditMessageContext {
    prevMessages?: MessageInfiniteData;
}

export const useEditMessage = (chatId: string) => {
    const queryClient = useQueryClient();
    const chatMessagesKey = messageKeys.chat(chatId);
    const chatsListKey = chatKeys.all;

    return useMutation<EditMessageResponse, Error, EditMessageVars, EditMessageContext>({
        mutationFn: ({ messageId, content }) => editMessage(chatId, messageId, content),
        onMutate: async ({ messageId, content }) => {
            //cancel queries
            await queryClient.cancelQueries({ queryKey: chatMessagesKey });

            //ignore chats list last message (for now)
            //snapshot prev state
            const prevMessages = queryClient.getQueryData<MessageInfiniteData>(chatMessagesKey);

            //update message cache
            queryClient.setQueryData<MessageInfiniteData>(chatMessagesKey, (old) =>
                old
                    ? {
                          ...old,
                          pages: old.pages.map((page) => ({
                              ...page,
                              messages: page.messages.map((msg) =>
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
                      }
                    : old
            );

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
            queryClient.setQueryData<MessageInfiniteData>(chatMessagesKey, (old) =>
                old
                    ? {
                          ...old,
                          pages: old.pages.map((page) => ({
                              ...page,
                              messages: page.messages.map((msg) =>
                                  msg.id === updatedMessage.messageId
                                      ? { ...msg, content: updatedMessage.content }
                                      : msg
                              ),
                          })),
                      }
                    : old
            );
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: chatMessagesKey });
            queryClient.invalidateQueries({ queryKey: chatsListKey });
        },
    });
};
