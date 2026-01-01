'use client';

import { createGroup } from '@/services/chats/chat.api';
import { chatKeys } from '@/services/chats/chat.keys';
import { ChatItemResponse, ChatsListQueryData } from '@/types/chats';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CreateGroupVars {
    groupTitle: string;
    userIds: string[];
}

export const useCreateGroup = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation<ChatItemResponse, Error, CreateGroupVars, {}>({
        mutationFn: ({ groupTitle, userIds }) => createGroup(groupTitle, userIds),
        onSuccess: (newChat) => {
            queryClient.setQueryData<ChatsListQueryData>(chatKeys.all, (old) =>
                old ? [newChat, ...old] : [newChat]
            );

            toast.success('Group created');
            router.push(`/chats/${newChat.id}`);
        },
    });
};
