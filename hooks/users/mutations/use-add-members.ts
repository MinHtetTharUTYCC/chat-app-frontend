'use client';
import { addMembers } from '@/services/chats/chat.api';
import { chatKeys } from '@/services/chats/chat.keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useAddMembers = (chatId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ users }: { users: string[] }) => addMembers(chatId, users),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: chatKeys.chat(chatId) });
            queryClient.invalidateQueries({ queryKey: chatKeys.all });
            toast.success('Successfully added to group');
        },
    });
};
