import { searchUsersToInviteOrAdd } from '@/services/chats/chat.api';
import { chatKeys } from '@/services/chats/chat.keys';
import { useQuery } from '@tanstack/react-query';

export const useSearchUsersToInvite = (chatId: string, q: string, open: boolean) => {
    return useQuery({
        queryKey: chatKeys.invite_search(chatId, q),
        queryFn: () => searchUsersToInviteOrAdd(chatId, q),
        enabled: open,
    });
};
