'use client';
import { api } from '@/lib/api';
import { messageKeys } from '@/services/messages/messages.keys';
import { MessagesResponse } from '@/types/types';
import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';

interface UseMessagesOptions {
    chatId: string;
    jumpToMessageId?: string;
    jumpToDate?: string;
}

type MessagePageParam = {
    cursor: string;
    direction: 'forward' | 'backward';
} | null;

interface MessageQueryParams {
    limit: number;
    nextCursor?: string;
    prevCursor?: string;
    aroundMessageId?: string;
    aroundDate?: string;
}

export function useMessages({ chatId, jumpToMessageId, jumpToDate }: UseMessagesOptions) {
    return useInfiniteQuery<
        MessagesResponse,
        Error,
        InfiniteData<MessagesResponse>,
        readonly any[],
        MessagePageParam
    >({
        queryKey: messageKeys.chat(chatId),
        queryFn: async ({ pageParam }) => {
            const params: MessageQueryParams = { limit: 20 };

            if (pageParam) {
                // pageParam is our custom object { cursor, direction }
                if (pageParam.direction === 'forward') {
                    params.nextCursor = pageParam.cursor;
                } else {
                    params.prevCursor = pageParam.cursor;
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
        // Forward = Newer messages (scrolling down)
        getNextPageParam: (lastPage) =>
            lastPage.meta?.nextCursor
                ? { cursor: lastPage.meta.nextCursor, direction: 'forward' }
                : null,
        // Backward = Older messages (scrolling up)
        getPreviousPageParam: (firstPage) =>
            firstPage.meta?.prevCursor
                ? { cursor: firstPage.meta.prevCursor, direction: 'backward' }
                : null,
        enabled: !!chatId,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        gcTime: 10 * 60 * 1000,
    });
}
