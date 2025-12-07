import { api } from '@/lib/api';
import { useInfiniteQuery } from '@tanstack/react-query';

interface UseMessagesOptions {
    chatId: string;
    jumpToMessageId?: string;
    jumpToDate?: string;
}

export function UseBidirectionalMessages({
    chatId,
    jumpToMessageId,
    jumpToDate,
}: UseMessagesOptions) {
    return useInfiniteQuery({
        queryKey: ['messages', chatId, jumpToMessageId, jumpToDate],
        queryFn: async ({ pageParam, direction }) => {
            const params: any = { limit: 20 };

            console.log("Direction",direction)

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

            console.log("Params:",params)

            const res = await api.get(`/chats/${chatId}/messages`, { params });
            console.log("RESS:",res)
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
}
