import { inviteUsers } from '@/services/chats/chat.api';
import { notificationKeys } from '@/services/noti/noti.keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useInvite = (chatId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ users }: { users: string[] }) => inviteUsers(chatId, users),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
            toast.success('Invited to group successfully');
        },
    });
};
