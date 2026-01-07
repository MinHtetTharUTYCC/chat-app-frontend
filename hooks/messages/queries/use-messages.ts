'use client';
import { getMessages, MessageQueryParams } from '@/services/messages/message.api';
import { messageKeys } from '@/services/messages/messages.keys';
import { MessagesResponse } from '@/types/messages';
import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';

interface UseMessagesOptions {
    chatId: string;
    jumpToMessageId?: string;
    jumpToDate?: string;
    enabled?: boolean;
}

type MessagePageParam =
    | {
          cursor: string;
          direction: 'forward' | 'backward';
      }
    | undefined;

type MessagesChatKey = ReturnType<typeof messageKeys.chat>;

export function useMessages({
    chatId,
    jumpToMessageId,
    jumpToDate,
    enabled = true,
}: UseMessagesOptions) {
    return useInfiniteQuery<
        MessagesResponse,
        Error,
        InfiniteData<MessagesResponse>,
        MessagesChatKey,
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

            return getMessages(chatId, params);
        },
        initialPageParam: undefined,
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
        enabled,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        gcTime: 10 * 60 * 1000,
    });
}
