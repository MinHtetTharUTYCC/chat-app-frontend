'use client';

import { chatKeys } from '@/services/chats/chat.keys';
import { startChat } from '@/services/chats/start-chat';
import { ChatItemResponse } from '@/types/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export const useStartChat = (otherUserId: string) => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: () => startChat(otherUserId),
        onSuccess: (newChat) => {
            queryClient.setQueryData(chatKeys.all, (old: ChatItemResponse[] | undefined) => {
                if (!old) return [newChat];
                return [newChat, ...old];
            });

            router.push(`/chats/${newChat.id}`);
        },
    });
};
