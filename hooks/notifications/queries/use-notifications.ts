import { getNotifications } from '@/services/noti/noti.api';
import { notificationKeys } from '@/services/noti/noti.keys';
import { useInfiniteQuery } from '@tanstack/react-query';

export function useNotifications() {
    return useInfiniteQuery({
        queryKey: notificationKeys.all,
        queryFn: ({ pageParam }) => getNotifications(pageParam),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) =>
            lastPage.meta.hasMore && lastPage.meta.nextCursor
                ? lastPage.meta.nextCursor
                : undefined,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        gcTime: 10 * 60 * 1000,
    });
}
