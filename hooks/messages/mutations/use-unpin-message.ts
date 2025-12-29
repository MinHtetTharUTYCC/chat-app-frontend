'use client';

import { useAuthStore } from '@/hooks/use-auth-store';
import { ActionResponse, unpinMessage } from '@/services/messages/message.api';
import { messageKeys, pinnedKeys } from '@/services/messages/messages.keys';
import { MessageInfiniteData, PinnedInfiniteData } from '@/types/messages';
import { PinItem } from '@/types/messages';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UnpinMessageVars {
    messageId: string;
}

interface UnpinMessageContext {
    prevMessages?: MessageInfiniteData;
    prevPinned?: PinnedInfiniteData;
}

export const useUnpinMessage = (chatId: string) => {
    const queryClient = useQueryClient();
    const currentUser = useAuthStore((store) => store.currentUser);

    const chatMessagesKey = messageKeys.chat(chatId);
    const pinnedKey = pinnedKeys.chat(chatId);

    return useMutation<ActionResponse, Error, UnpinMessageVars, UnpinMessageContext>({
        mutationFn: ({ messageId }) => unpinMessage(chatId, messageId),
        onMutate: async ({ messageId }) => {
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
                                      ? { ...msg, isPinned: false, pinnedByUserId: null }
                                      : msg
                              ),
                          })),
                      }
                    : old
            );

            queryClient.setQueryData<PinnedInfiniteData>(pinnedKey, (old) =>
                old
                    ? {
                          ...old,
                          pages: old.pages.map((page) => ({
                              ...page,
                              pinnedMessages: page.pinnedMessages.filter(
                                  (pin: PinItem) => pin.messageId !== messageId
                              ),
                          })),
                      }
                    : old
            );

            return { prevMessages, prevPinned };
        },
        onError: (err, _vars, context) => {
            toast.error('Failed to unpin message');
            console.error('Failed to unpin message:', err);

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
