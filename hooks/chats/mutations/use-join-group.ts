'use client';

import { joinGroup } from '@/services/chats/chat.api';
import { chatKeys } from '@/services/chats/chat.keys';
import { messageKeys } from '@/services/messages/messages.keys';
import { JoinGroupResponse } from '@/types/actions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const useJoinGroup = (chatId: string) => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const chatsListKey = chatKeys.all;
    const chatMessagesKey = messageKeys.chat(chatId);

    return useMutation<JoinGroupResponse, Error, {}, {}>({
        mutationFn: () => joinGroup(chatId),
        onSuccess: () => {
            toast.success('Joined group successfully!');

            queryClient.invalidateQueries({ queryKey: chatsListKey });
            queryClient.invalidateQueries({ queryKey: chatMessagesKey });
            router.refresh();
        },
    });
};
