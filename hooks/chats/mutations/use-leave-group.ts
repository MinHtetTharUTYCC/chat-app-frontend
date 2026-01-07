'use client';

import { leaveGroup } from '@/services/chats/chat.api';
import { chatKeys } from '@/services/chats/chat.keys';
import { ChatsListQueryData } from '@/types/chats';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const useLeaveGroup = (chatId: string) => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const chatsListKey = chatKeys.all;

    return useMutation({
        mutationFn: () => leaveGroup(chatId),
        onSuccess: () => {
            const chats = queryClient.getQueryData<ChatsListQueryData>(chatsListKey);
            const remainingChats = chats?.filter((c) => c.id !== chatId);

            if (remainingChats) {
                router.push(`/chats/${remainingChats[0].id}`);
            } else {
                router.push('/chats');
            }
            toast.success('Left group successfully');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: chatsListKey });
        },
    });
};
