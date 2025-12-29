'use client';

import { updateTitle } from '@/services/chats/chat.api';
import { chatKeys } from '@/services/chats/chat.keys';
import { ChatDetailsQueryData, ChatsListQueryData } from '@/types/chats';
import { UpdateTitleResponse } from '@/types/actions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UpdateTitleVars {
    chatId: string;
    title: string;
}

interface UpdateTitleContext {
    prevChat?: ChatDetailsQueryData;
    prevChatsList?: ChatsListQueryData;
}

export const useUpdateTitle = () => {
    const queryClient = useQueryClient();

    return useMutation<UpdateTitleResponse, Error, UpdateTitleVars, UpdateTitleContext>({
        mutationFn: ({ chatId, title }) => updateTitle(chatId, title),
        onMutate: async ({ chatId, title }) => {
            const chatKey = chatKeys.chat(chatId);
            const chatsListKey = chatKeys.all;

            //cancel ongoing queries
            await Promise.all([
                queryClient.cancelQueries({ queryKey: chatKey }),
                queryClient.cancelQueries({ queryKey: chatsListKey }),
            ]);

            //snapshop prev values
            const prevChat = queryClient.getQueryData<ChatDetailsQueryData>(chatKey);
            const prevChatsList = queryClient.getQueryData<ChatsListQueryData>(chatsListKey);

            // optimistic update
            // chat details
            queryClient.setQueryData<ChatDetailsQueryData>(chatKey, (old) =>
                old ? { ...old, title } : old
            );
            // chats list
            queryClient.setQueryData<ChatsListQueryData>(chatsListKey, (old) =>
                old ? old.map((chat) => (chat.id === chatId ? { ...chat, title } : chat)) : old
            );

            return { prevChat, prevChatsList };
        },
        onError: (err, { chatId }, context) => {
            console.error('Failed to update chat title:', err);
            toast.error('Failed to update chat title');

            if (context?.prevChat) {
                queryClient.setQueryData(chatKeys.chat(chatId), context.prevChat);
            }
            if (context?.prevChatsList) {
                queryClient.setQueryData(chatKeys.all, context.prevChatsList);
            }
        },
        onSettled: (_data, _error, { chatId }) => {
            queryClient.invalidateQueries({ queryKey: chatKeys.chat(chatId) });
            queryClient.invalidateQueries({ queryKey: chatKeys.all });
        },
    });
};
