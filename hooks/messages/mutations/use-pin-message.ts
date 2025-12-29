'use client';

import { useAuthStore } from '@/hooks/use-auth-store';
import { ActionResponse, pinMessage } from '@/services/messages/message.api';
import { messageKeys, pinnedKeys } from '@/services/messages/messages.keys';
import { MessageInfiniteData, PinnedInfiniteData } from '@/types/messages';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface PinMessageVars {
    messageId: string;
    content: string;
    msgSenderId: string;
}

interface PinMessageContext {
    prevMessages?: MessageInfiniteData;
    prevPinned?: PinnedInfiniteData;
}

export const usePinMessage = (chatId: string) => {
    const queryClient = useQueryClient();
    const currentUser = useAuthStore((store) => store.currentUser);

    const chatMessagesKey = messageKeys.chat(chatId);
    const pinnedKey = pinnedKeys.chat(chatId);

    return useMutation<ActionResponse, Error, PinMessageVars, PinMessageContext>({
        mutationFn: ({ messageId }) => pinMessage(chatId, messageId),
        onMutate: async ({ messageId, content, msgSenderId }) => {
            if (!currentUser) throw new Error('You need to authenticate first');

            //cancel queries

            await Promise.all([
                queryClient.cancelQueries({ queryKey: pinnedKey }),
                queryClient.cancelQueries({ queryKey: chatMessagesKey }),
            ]);

            //snapshot prev state
            const prevMessages = queryClient.getQueryData<MessageInfiniteData>(chatMessagesKey);
            const prevPinned = queryClient.getQueryData<PinnedInfiniteData>(pinnedKey);

            queryClient.setQueryData<MessageInfiniteData>(chatMessagesKey, (old) =>
                old
                    ? {
                          ...old,
                          pages: old.pages.map((page) => ({
                              ...page,
                              messages: page.messages.map((msg) =>
                                  msg.id === messageId
                                      ? { ...msg, isPinned: true, pinnedByUserId: currentUser.id }
                                      : msg
                              ),
                          })),
                      }
                    : old
            );

            const tempId = `temp-${Date.now()}-${Math.random()}`;
            const newPin = {
                id: tempId,
                chatId,
                messageId,
                pinnedByUserId: currentUser.id,
                user: {
                    id: currentUser.id,
                    username: currentUser.username,
                },
                message: {
                    id: messageId,
                    content,
                    senderId: msgSenderId,
                },
                createdAt: new Date().toISOString(),
            };

            queryClient.setQueryData<PinnedInfiniteData>(pinnedKey, (old) => {
                if (!old?.pages) return old;

                const newPages = [...old.pages];
                newPages[0] = {
                    ...newPages[0],
                    pinnedMessages: [newPin, ...newPages[0].pinnedMessages],
                };

                return {
                    ...old,
                    pages: newPages,
                };
            });

            return { prevMessages, prevPinned };
        },
        onError: (err, _vars, context) => {
            console.error('Failed to pin message');
            toast.error('Failed to pin message');

            if (context?.prevMessages) {
                queryClient.setQueryData(chatMessagesKey, context.prevMessages);
            }
            if (context?.prevPinned) {
                queryClient.setQueryData(pinnedKey, context.prevPinned);
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: chatMessagesKey });
            queryClient.invalidateQueries({ queryKey: pinnedKey });
        },
    });
};
