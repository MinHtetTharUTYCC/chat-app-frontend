'use client';

import { chatKeys } from '@/services/chats/chat.keys';
import { startChat } from '@/services/chats/chat.api';
import { ChatItemResponse } from '@/types/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export const useStartChat = (
    otherUserId: string,
    setIsOpen: (open: boolean) => void,
    onDone: () => void
) => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: () => startChat(otherUserId),
        onSuccess: ({ oldChatExists, chat }) => {
            if (!oldChatExists) {
                queryClient.setQueryData(chatKeys.all, (old: ChatItemResponse[] | undefined) => {
                    if (!old) return [chat];
                    return [chat, ...old];
                });
            }

            setIsOpen(false);
            onDone();

            router.push(`/chats/${chat.id}`);
        },
    });
};
