'use client';

import { useAuthStore } from '@/hooks/use-auth-store';
import { ActionResponse, unpinMessage } from '@/services/messages/message.api';
import { messageKeys, pinnedKeys } from '@/services/messages/messages.keys';
import { MessageItem, PinItem } from '@/types/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UnpinMessageVars {
    messageId: string;
}

interface UnpinMessageContext {
    prevMessages: unknown;
    prevPinned: unknown;
}

export const useUnpinMessage = (chatId: string) => {
    const queryClient = useQueryClient();
    const chatMessagesKey = messageKeys.chat(chatId);
    const pinnedKey = pinnedKeys.chat(chatId);
    const currentUser = useAuthStore((store) => store.currentUser);

    return useMutation<ActionResponse, Error, UnpinMessageVars, UnpinMessageContext>({
        mutationFn: ({ messageId }) => unpinMessage(chatId, messageId),
        onMutate: async ({ messageId }) => {
            if (!currentUser) throw new Error('You need to authenticate first');
            //cancel queries
            await queryClient.cancelQueries({ queryKey: pinnedKey });
            //snapshot prev state
            const prevMessages = queryClient.getQueryData(chatMessagesKey);
            const prevPinned = queryClient.getQueryData(pinnedKey);

            queryClient.setQueryData(chatMessagesKey, (old: any) => {
                if (!old?.pages) return old;

                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        messages: page.messages.map((msg: MessageItem) =>
                            msg.id === messageId
                                ? { ...msg, isPinned: false, pinnedByUserId: null }
                                : msg
                        ),
                    })),
                };
            });
            queryClient.setQueryData(pinnedKey, (old: any) => {
                if (!old?.pages) return old;

                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        pinnedMessages: page.pinnedMessages.filter(
                            (pin: PinItem) => pin.messageId !== messageId
                        ),
                    })),
                };
            });

            return { prevMessages, prevPinned };
        },
        onError: (err: any, _vars, context) => {
            if (context?.prevMessages) {
                queryClient.setQueryData(chatMessagesKey, context.prevMessages);
            }
            if (context?.prevPinned) {
                queryClient.setQueryData(pinnedKey, context.prevPinned);
            }
            const message = err?.response?.data?.message ?? 'Something went wrong';

            toast.error(message);
            console.error('Failed to unpin message:', err);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: chatMessagesKey });
            queryClient.invalidateQueries({ queryKey: pinnedKey });
        },
    });
};
