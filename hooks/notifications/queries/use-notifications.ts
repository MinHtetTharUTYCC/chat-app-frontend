'use client';

import { useAuthStore } from '@/hooks/use-auth-store';
import { getNotifications } from '@/services/noti/noti.api';
import { notificationKeys } from '@/services/noti/noti.keys';
import { useInfiniteQuery } from '@tanstack/react-query';

export function useNotifications() {
    const { accessToken, authReady } = useAuthStore();
    return useInfiniteQuery({
        queryKey: notificationKeys.all,
        queryFn: ({ pageParam }) => getNotifications(pageParam),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        gcTime: 10 * 60 * 1000,
        enabled: !!accessToken && authReady,
    });
}
