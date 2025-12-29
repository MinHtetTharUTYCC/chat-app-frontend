'use client';

import { createGroup } from '@/services/chats/chat.api';
import { chatKeys } from '@/services/chats/chat.keys';
import { ChatItemResponse } from '@/types/chats';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const useCreateGroup = (groupTitle: string, userIds: string[]) => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: () => createGroup(groupTitle, userIds),
        onSuccess: (newChat) => {
            queryClient.setQueryData(chatKeys.all, (old: ChatItemResponse[] | undefined) => {
                if (!old) return [newChat];
                return [newChat, ...old];
            });

            toast.success('Group created');
            router.push(`/chats/${newChat.id}`);
        },
    });
};
