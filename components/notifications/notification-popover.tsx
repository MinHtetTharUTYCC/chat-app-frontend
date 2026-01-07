'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, RotateCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationItem } from '@/types/notifications';
import { useState } from 'react';
import { useNotifications } from '@/hooks/notifications/queries/use-notifications';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/hooks/use-app-store';
import NotiItem from './noti-Item';

export function NotificationPopover() {
    const router = useRouter();

    const { setChatsOpen } = useAppStore();

    const {
        data: notiData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
        isRefetching,
        isError,
    } = useNotifications();
    const [isNotiOpen, setIsNotiOpen] = useState(false);

    const notifications = notiData?.pages.flatMap((page) => page.data) ?? [];

    const handleNotiClick = (chatId: string, messageId?: string) => {
        setIsNotiOpen(false);
        setChatsOpen(false);
        if (messageId) {
            router.push(`/chats/${chatId}?messageId=${messageId}`);
        } else {
            router.push(`/chats/${chatId}`);
        }
    };

    return (
        <Popover open={isNotiOpen} onOpenChange={setIsNotiOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                        <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
                {isError ? (
                    <div className="flex items-center justify-center gap-2">
                        <p className="text-sm text-muted-foreground">Something went wrong</p>
                        <Button variant={'outline'} onClick={() => refetch()}>
                            Retry
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="p-3 font-semibold border-b flex items-center justify-between">
                            Notifications
                            <Button
                                variant={'ghost'}
                                size={'icon'}
                                onClick={() => refetch()}
                                disabled={isRefetching}
                            >
                                <RotateCw className={`${isRefetching && 'animate-spin'}`} />
                            </Button>
                        </div>
                        <ScrollArea className="h-100">
                            <div className="flex flex-col gap-1">
                                {isRefetching && !isFetchingNextPage && (
                                    <div className="py-2 text-xs text-center text-primary animate-pulse">
                                        Updating list...
                                    </div>
                                )}

                                {notifications?.length > 0 ? (
                                    notifications.map((notif: NotificationItem) => (
                                        <NotiItem
                                            key={notif.id}
                                            notification={notif}
                                            onNotiClick={() =>
                                                handleNotiClick(notif.chatId, notif.data?.messageId)
                                            }
                                        />
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        No new notifications
                                    </div>
                                )}

                                <div className="mt-2">
                                    {hasNextPage ? (
                                        <Button
                                            onClick={() => fetchNextPage()}
                                            disabled={isFetchingNextPage}
                                            variant={'ghost'}
                                            className="w-full text-sm my-4 cursor-pointer"
                                        >
                                            {isFetchingNextPage
                                                ? 'Loading more...'
                                                : 'See older notifications'}
                                        </Button>
                                    ) : (
                                        notifications.length > 0 && (
                                            <p className="my-3 text-sm text-center text-muted-foreground">
                                                No more notifications to show
                                            </p>
                                        )
                                    )}
                                </div>
                            </div>
                        </ScrollArea>
                    </>
                )}
            </PopoverContent>
        </Popover>
    );
}
