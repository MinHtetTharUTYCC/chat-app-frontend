'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

export function NotificationPopover() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey: ['notifications'],
        queryFn: async ({ pageParam = null }) => {
            const res = await api.get('/notifications', {
                params: {
                    cursor: pageParam,
                },
            });

            return res.data; // { data, meta }
        },

        getNextPageParam: (lastPage) => {
            return lastPage.meta.hasMore ? lastPage.meta.nextCursor : undefined;
        },
        initialPageParam: null,
    });

    const notifications = data?.pages.flatMap((page) => page.data) ?? [];

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                        <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
                <div className="p-3 font-semibold border-b">Notifications</div>
                <ScrollArea className="h-[300px]">
                    {notifications?.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No new notifications
                        </div>
                    ) : (
                        notifications.map((notif: any) => (
                            <div key={notif.id} className="p-3 border-b hover:bg-accent text-sm">
                                <p className="font-medium">{notif.title}</p>
                                <p className="text-muted-foreground">{notif.message}</p>
                                <span className="text-xs text-muted-foreground mt-1 block">
                                    {formatDistanceToNow(new Date(notif.createdAt), {
                                        addSuffix: true,
                                    })}
                                </span>
                            </div>
                        ))
                    )}

                    {/* Load more infinite */}
                    {hasNextPage && (
                        <button
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            className="w-full py-2 text-sm text-center text-blue-600 hover:underline"
                        >
                            {isFetchingNextPage ? 'Loading...' : 'Load More'}
                        </button>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
