'use client';

import { leaveGroup } from '@/services/chats/chat.api';
import { chatKeys } from '@/services/chats/chat.keys';
import { LeaveGroupResponse } from '@/types/actions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const useLeaveGroup = (chatId: string, setChatsOpen: (open: boolean) => void) => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const chatsListKey = chatKeys.all;

    return useMutation<LeaveGroupResponse, Error, {}, {}>({
        mutationFn: () => leaveGroup(chatId),
        onSuccess: () => {
            const chats = queryClient.getQueryData<any[]>(chatsListKey);
            const remainingChats = chats?.filter((c) => c.id !== chatId);

            if (remainingChats) {
                router.push(`/chats/${remainingChats[0].id}`);
            } else {
                router.push('/chats');
            }

            queryClient.invalidateQueries({ queryKey: chatsListKey });
            setChatsOpen(false);
            toast.success('Leaved group successfully');
        },
    });
};
