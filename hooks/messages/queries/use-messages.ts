import { api } from '@/lib/api';
import { messageKeys } from '@/services/messages/messages.keys';
import { queryOptions, useInfiniteQuery } from '@tanstack/react-query';

interface MessagesProps {
    chatId: string;
    jumpToMessageId?: string;
    jumpToDate?: string;
}

interface MessagesResponse {
    data: any[]; // Replace with your actual message type
    meta: {
        nextCursor?: string | null;
        prevCursor?: string | null;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export const getMessagesQueryOptions = (props: MessagesProps) => {
    const { chatId, jumpToMessageId, jumpToDate } = props;
    return queryOptions({
        queryKey: messageKeys.list(chatId, jumpToMessageId, jumpToDate),
        queryFn: async ({ pageParam, direction }) => {
            const params: any = { limit: 20 };

            if (pageParam) {
                if (direction === 'forward') {
                    params.nextCursor = pageParam;
                } else {
                    params.prevCursor = pageParam;
                }
            } else if (jumpToMessageId) {
                params.aroundMessageId = jumpToMessageId;
            } else if (jumpToDate) {
                params.aroundDate = jumpToDate;
            }

            const res = await api.get(`/chats/${chatId}/messages`, { params });
            return res.data;
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.meta?.nextCursor || null, //older (going to top)
        getPreviousPageParam: (firstPage) => firstPage.meta?.prevCursor || null, //newer(going to bottom)
        enabled: !!chatId,

        // ✅ Keep data fresh for 5 minutes
        staleTime: 5 * 60 * 1000, // 5 minutes
        // ✅ Don't refetch on window focus
        refetchOnWindowFocus: false,
        // ✅ Don't refetch on mount if data exists
        refetchOnMount: false,
        // ✅ Keep cache for 10 minutes(default: 5min)
        gcTime: 10 * 60 * 1000,
    });
};

export const useMessages = (props: MessagesProps) =>
    useInfiniteQuery(getMessagesQueryOptions(props));
