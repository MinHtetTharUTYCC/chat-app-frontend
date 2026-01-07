import { searchMessagesInChat } from '@/services/messages/message.api';
import { useQuery } from '@tanstack/react-query';

export const useSearchMessages = (isOpen: boolean, chatId: string, debounceSearch: string) => {
    return useQuery({
        queryKey: ['searchMessages', chatId, debounceSearch],
        queryFn: () => searchMessagesInChat(chatId, debounceSearch),
        enabled: isOpen && debounceSearch.trim().length > 0,
        staleTime: 30000,
        retry: 1,
    });
};
