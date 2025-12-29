'use client';

import { getPinned } from '@/services/messages/message.api';
import { pinnedKeys } from '@/services/messages/messages.keys';
import { useInfiniteQuery } from '@tanstack/react-query';

interface UsePinnedOptions {
    chatId: string;
    isSheetOpen: boolean;
}

export const usePinned = ({ chatId, isSheetOpen }: UsePinnedOptions) => {
    return useInfiniteQuery({
        queryKey: pinnedKeys.chat(chatId),
        queryFn: async ({ pageParam }) => getPinned(chatId, pageParam),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => {
            return lastPage.meta.hasMore ? lastPage.meta.nextCursor : undefined;
        },
        enabled: !!chatId && isSheetOpen,

        // ✅ Keep data fresh for 5 minutes
        staleTime: 5 * 60 * 1000,

        // ✅ Don't refetch on window focus
        refetchOnWindowFocus: false,

        // ✅ Don't refetch on mount if data exists
        refetchOnMount: false,

        // ✅ Keep cache for 10 minutes(default: 5min)
        gcTime: 10 * 60 * 1000,
    });
};
