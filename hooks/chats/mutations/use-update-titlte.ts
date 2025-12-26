'use client';

import { updateTitle } from '@/services/chats/chat.api';
import { chatKeys } from '@/services/chats/chat.keys';
import { ChatItemResponse, UpdateTitleResponse } from '@/types/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UpdateTitleVars {
    title: string;
    setChatTitle: (title: string) => void;
    setIsOpen: (open: boolean) => void;
    closeSheet: () => void;
}
interface UpdateTitleContext {
    prevChat?: ChatItemResponse;
    prevChatsList?: unknown;
}

export const useUpdateTitle = (chatId: string, setChatTitle: (title: string) => void) => {
    const queryClient = useQueryClient();

    const chatKey = chatKeys.chat(chatId);
    const chatsListKey = chatKeys.all;

    return useMutation<UpdateTitleResponse, Error, UpdateTitleVars, UpdateTitleContext>({
        mutationFn: ({ title }) => updateTitle(chatId, title),
        onMutate: async ({ title, setChatTitle, setIsOpen, closeSheet }) => {
            //cancel ongoing queries
            await queryClient.cancelQueries({ queryKey: chatKey });
            await queryClient.cancelQueries({ queryKey: chatsListKey });

            //snapshop prev values
            const prevChat: ChatItemResponse | undefined = queryClient.getQueryData([
                'chat',
                chatId,
            ]);
            const prevChatsList = queryClient.getQueryData(['chats']);

            //optimistic update
            queryClient.setQueryData(['chat', chatId], (old: any) => ({
                ...old,
                title,
            }));
            queryClient.setQueryData(['chats'], (old: any) => {
                if (!old) return old;
                return old.map((chat: any) => (chat.id === chatId ? { ...chat, title } : chat));
            });

            setChatTitle(title);
            setIsOpen(false);
            closeSheet();

            return { prevChat, prevChatsList };
        },
        onError: (err, _, context) => {
            console.error('Failed to update chat title:', err);
            toast.error('Failed to update chat title');

            if (context?.prevChat) {
                queryClient.setQueryData(chatKey, context.prevChat);
                setChatTitle(context.prevChat.title ?? 'New Group');
            }
            if (context?.prevChatsList) {
                queryClient.setQueryData(chatsListKey, context.prevChatsList);
            }
        },
        onSettled: async () => {
            queryClient.invalidateQueries({ queryKey: chatKey });
            queryClient.invalidateQueries({ queryKey: chatsListKey });
        },
    });
};
