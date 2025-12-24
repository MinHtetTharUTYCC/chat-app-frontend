'use client';

import { useAuthStore } from '@/hooks/use-auth-store';
import { ActionResponse, pinMessage } from '@/services/messages/message.api';
import { messageKeys, pinnedKeys } from '@/services/messages/messages.keys';
import { MessageItem } from '@/types/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface PinMessageVars {
    messageId: string;
    content: string;
}

interface PinMessageContext {
    prevMessages: unknown;
    prevPinned: unknown;
}

export const usePinMessage = (chatId: string) => {
    const queryClient = useQueryClient();
    const chatMessagesKey = messageKeys.chat(chatId);
    const pinnedKey = pinnedKeys.chat(chatId);
    const currentUser = useAuthStore((store) => store.currentUser);

    return useMutation<ActionResponse, Error, PinMessageVars, PinMessageContext>({
        mutationFn: ({ messageId }) => pinMessage(chatId, messageId),
        onMutate: async ({ messageId, content }) => {
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
                                ? { ...msg, isPinned: true, pinnedByUserId: currentUser.id }
                                : msg
                        ),
                    })),
                };
            });

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
                },
                createdAt: new Date().toISOString(),
            };

            queryClient.setQueryData(pinnedKey, (old: any) => {
                console.log('P', old);
                if (!old?.pages) return old;

                const newPages = [...old.pages];
                newPages[0] = {
                    ...newPages[0],
                    pinnedMessages: [newPin, ...newPages[0].pinnedMessages],
                };

                console.log('NP', newPages);

                return {
                    ...old,
                    pages: newPages,
                };
            });

            return { prevMessages, prevPinned };
        },
        onError: (err, _vars, context) => {
            if (context?.prevMessages) {
                queryClient.setQueryData(chatMessagesKey, context.prevMessages);
            }
            console.error('Failed to pin message:', err);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: chatMessagesKey });
            queryClient.invalidateQueries({ queryKey: pinnedKey });
        },
    });
};
