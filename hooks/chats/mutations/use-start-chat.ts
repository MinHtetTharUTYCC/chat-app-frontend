'use client';

import { chatKeys } from '@/services/chats/chat.keys';
import { startChat } from '@/services/chats/chat.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ChatsListQueryData } from '@/types/chats';

export const useStartChat = (otherUserId: string) => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: () => startChat(otherUserId),
        onSuccess: ({ oldChatExists, chat }) => {
            if (!oldChatExists) {
                queryClient.setQueryData<ChatsListQueryData>(chatKeys.all, (old) =>
                    old ? [chat, ...old] : old
                );
            }
            router.push(`/chats/${chat.id}`);
        },
    });
};
