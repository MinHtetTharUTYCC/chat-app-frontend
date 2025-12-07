'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Clock, Loader2, MoreVertical } from 'lucide-react';
import { Avatar, AvatarImage } from '../ui/avatar';
import { AvatarFallback } from '@radix-ui/react-avatar';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/hooks/use-app-store';
import { useEffect, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { usePresenceStore } from '@/hooks/use-presence-store';
import { getLastSeenToday } from '@/lib/chat/last-seen-today';
import { useAuthStore } from '@/hooks/use-auth-store';
import { toast } from 'sonner';
import { Skeleton } from '../ui/skeleton';
import { ScrollArea } from '../ui/scroll-area';
import { cn, formatMessageDate } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchMessage from './search/search-message';

interface ChatSettingsSheetProps {
    chatId: string;
    isDM: boolean;
    title: string | null;
    dmParticipantname: string | null;
    participants: any[];
    createdAt: Date;
}

interface UpdateTitleContext {
    prevChat: any;
    prevChatsList: any;
}

function ChatSettingsSheet({
    chatId,
    isDM,
    title,
    dmParticipantname,
    participants,
    createdAt,
}: ChatSettingsSheetProps) {
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const router = useRouter();

    const { setChatsOpen } = useAppStore();
    const { getPresence } = usePresenceStore();
    const { currentUser } = useAuthStore();

    const [chatName, setChatName] = useState(dmParticipantname || title || 'Chat Info');
    const [inputTitle, setInputTitle] = useState(title ?? '');

    const autoScrollRef = useRef<HTMLDivElement | null>(null);
    const autoLoadRef = useRef<HTMLDivElement | null>(null);

    const [hasScrolled, setHasScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const {
        data: pinned,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isPinnedLoading,
    } = useInfiniteQuery({
        queryKey: ['pinned', chatId],
        queryFn: async ({ pageParam = undefined }) => {
            const response = await api.get(`/chats/${chatId}/pinned`, {
                params: { cursor: pageParam, limit: 10 },
            });
            return response.data;
        },
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => {
            return lastPage.meta?.hasMore ? lastPage.meta.nextCursor : undefined;
        },
        enabled: !!chatId && isOpen,
        // ✅ Keep data fresh for 5 minutes
        staleTime: 5 * 60 * 1000,

        // ✅ Don't refetch on window focus
        refetchOnWindowFocus: false,

        // ✅ Don't refetch on mount if data exists
        refetchOnMount: false,

        // ✅ Keep cache for 10 minutes(default: 5min)
        gcTime: 10 * 60 * 1000,
    });

    const leaveMutation = useMutation({
        mutationFn: () => api.delete(`/chats/${chatId}/participants/leave-group`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            setChatsOpen(false);
            toast.success('Leaved group successfully');
        },
    });

    const updateChatTitleMutation = useMutation({
        mutationFn: () => api.patch(`/chats/${chatId}/update-title`, { title: inputTitle }),
        onMutate: async () => {
            //cancel ongoin queries
            await queryClient.cancelQueries({ queryKey: ['chat', chatId] });
            await queryClient.cancelQueries({ queryKey: ['chats'] });

            //snapshop prev values
            const prevChat = queryClient.getQueryData(['chat', chatId]);
            const prevChatsList = queryClient.getQueryData(['chats']);

            //optimistic update
            queryClient.setQueryData(['chat', chatId], (old: any) => ({
                ...old,
                title: inputTitle,
            }));
            queryClient.setQueryData(['chats'], (old: any) => {
                if (!old) return old;
                return old.map((chat: any) =>
                    chat.id === chatId ? { ...chat, title: inputTitle } : chat
                );
            });
            setChatName(inputTitle);

            return { prevChat, prevChatsList };
        },
        onSuccess: () => {
            toast.success('Group name updated successfully');
        },
        onError: (err, content, context: UpdateTitleContext | undefined) => {
            //rollback
            if (context?.prevChat) {
                queryClient.setQueryData(['chat', chatId], context.prevChat);
                setChatName(context.prevChat.title);
            }
            if (context?.prevChatsList) {
                queryClient.setQueryData(['chats'], context.prevChatsList);
            }

            console.error('Failed to update title: ', err);
        },
    });

    const handlePinMsgClick = async (messageId: string) => {
        const params = new URLSearchParams(searchParams);
        const msgIdParam = params.get('messageId');
        const dateParam = params.get('date');

        const messagesData = queryClient.getQueryData(['messages', chatId, msgIdParam, dateParam]);
        // const existingMessages = messagesData?.pages?.flatMap((page) => page.messages) || [];
        params.set('messageId', messageId);
        setIsOpen(false);
        router.replace(`/chats/${chatId}?${params.toString()}`);
    };

    const prevScrollHeightRef = useRef<number>(0);
    useEffect(() => {
        const viewport = autoLoadRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        const el = viewport as HTMLDivElement | null;
        if (!el) return;

        if (isFetchingNextPage) {
            // Store before fetch
            prevScrollHeightRef.current = el.scrollHeight;
            console.log('Before:', el.scrollHeight);
        } else if (prevScrollHeightRef.current > 0) {
            // Restore after fetch completes
            const heightDiff = el.scrollHeight - prevScrollHeightRef.current;
            el.scrollTop = el.scrollTop + heightDiff;
            prevScrollHeightRef.current = 0;
        }
    }, [isFetchingNextPage]);

    // Reset scroll state when sheet closes
    useEffect(() => {
        if (!isOpen) {
            setHasScrolled(false);
        }
    }, [isOpen]);

    useEffect(() => {
        setChatName(title || 'Chat Info');
        setInputTitle(title || '');
    }, [title]);

    // Scroll when data is loaded and sheet is open
    useEffect(() => {
        if (isOpen && pinned?.pages[0] && !hasScrolled) {
            setTimeout(() => {
                const viewport = autoLoadRef.current?.querySelector(
                    '[data-radix-scroll-area-viewport]'
                ) as HTMLElement;

                if (viewport) {
                    viewport.scrollTop = viewport.scrollHeight;
                    setHasScrolled(true);
                }
            }, 100); // Longer delay for reliability
        }
    }, [isOpen, chatId, pinned?.pages[0], hasScrolled]);

    //auto-load infinite scroll
    useEffect(() => {
        if (!isOpen) return;

        const setupScrollListener = () => {
            const viewport = autoLoadRef.current?.querySelector(
                '[data-radix-scroll-area-viewport]'
            );
            if (!viewport) {
                // setTimeout(setupScrollListener, 50);//retry
                console.log('***no-viewport');
                return;
            }

            console.log('🎯 Viewport found, setting up scroll listener');

            const handleScroll = () => {
                console.log('scrolling...');
                if (hasNextPage && !isFetchingNextPage && viewport.scrollTop <= 0) {
                    fetchNextPage();
                }
            };

            viewport.addEventListener('scroll', handleScroll);

            return () => viewport.removeEventListener('scroll', handleScroll);
        };

        //wait for sheet portal to render
        const timeOutId = setTimeout(setupScrollListener);

        return () => {
            clearTimeout(timeOutId);
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage, isOpen]);

    const pinnedMessages =
        pinned?.pages
            .flatMap((page: any) => (Array.isArray(page) ? page : page.pinnedMessages || []))
            .reverse() || [];

    return (
        <Sheet
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) {
                    setInputTitle(title ?? '');
                }
            }}
        >
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="cursor-pointer">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col h-screen max-h-screen p-2">
                <div className="shrink-0 space-y-4 pb-4">
                    <SheetHeader>
                        <SheetTitle className="m-0">{chatName}</SheetTitle>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <p className="text-xs">
                                {isDM ? 'Chat started ' : 'Group created '}
                                {formatDistanceToNow(createdAt, { addSuffix: true })}
                            </p>
                        </div>
                        <SearchMessage chatId={chatId} onCloseSheet={() => setIsOpen(false)} />
                    </SheetHeader>

                    {!isDM && (
                        <>
                            <Label className="text-xs text-muted-foreground">
                                Update Group Name
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    defaultValue={inputTitle}
                                    onChange={(e) => {
                                        const value = e.currentTarget.value;
                                        setInputTitle(value.trim());
                                        console.log(inputTitle);
                                    }}
                                />
                                <Button
                                    size="sm"
                                    className="cursor-pointer"
                                    onClick={() => updateChatTitleMutation.mutate()}
                                    disabled={updateChatTitleMutation.isPending}
                                >
                                    {updateChatTitleMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Update'
                                    )}
                                </Button>
                            </div>
                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={() => leaveMutation.mutate()}
                            >
                                Leave Group
                            </Button>
                        </>
                    )}
                </div>

                <div className="flex-1 min-h-0 overflow-hidden">
                    <Tabs defaultValue="pinned" className="w-full h-full flex flex-col">
                        <TabsList className="shrink-0 w-full flex items-center justify-center">
                            <TabsTrigger value="pinned">Pinned Messages</TabsTrigger>
                            {!isDM && <TabsTrigger value="participants">Participants</TabsTrigger>}
                        </TabsList>

                        <TabsContent value="pinned" className="flex-1 min-h-0 overflow-hidden">
                            {isPinnedLoading && (
                                <div className="space-y-2">
                                    {Array.from({ length: 5 }).map((_, idx) => (
                                        <Skeleton key={idx} className="h-10 w-full rounded" />
                                    ))}
                                </div>
                            )}
                            {!isPinnedLoading && pinnedMessages.length < 1 && (
                                <p className="text-center text-muted-foreground">
                                    No message is pinned.
                                </p>
                            )}
                            {!isPinnedLoading && pinnedMessages.length > 0 && (
                                <ScrollArea ref={autoLoadRef} className="h-full mb-10">
                                    {isFetchingNextPage && (
                                        <div className="flex items-center justify-center p-2">
                                            <Button
                                                variant={'ghost'}
                                                disabled={true}
                                                size={'sm'}
                                                className="flex items-center gap-2"
                                            >
                                                <Loader2
                                                    className="w-4 h-4 animate-spin"
                                                    strokeWidth={'3px'}
                                                />
                                                <p>loading...</p>
                                            </Button>
                                        </div>
                                    )}

                                    {pinnedMessages.map((pinMsg: any) => {
                                        const isMe = pinMsg.userId === currentUser?.id;
                                        return (
                                            <div
                                                key={pinMsg.id}
                                                className="flex items-end gap-2 p-2"
                                            >
                                                <Avatar className="h-8 w-8 bg-secondary cursor-pointer">
                                                    <AvatarImage src="https://images.unsplash.com/pphoto-1524504388940-b1c1722653e1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
                                                    <AvatarFallback className="w-full flex items-center justify-center">
                                                        <p className="text-center text-xs">
                                                            {pinMsg.user.username
                                                                .substring(0, 2)
                                                                .toUpperCase()}
                                                        </p>
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                                                        {formatMessageDate(pinMsg.createdAt)}
                                                    </span>
                                                    <div
                                                        className={cn(
                                                            'px-4 py-2 rounded-2xl text-sm cursor-pointer',
                                                            isMe
                                                                ? 'bg-primary text-primary-foreground rounded-br-none'
                                                                : 'bg-muted text-foreground rounded-bl-none'
                                                        )}
                                                        onClick={() =>
                                                            handlePinMsgClick(pinMsg.messageId)
                                                        }
                                                    >
                                                        {pinMsg.message.content}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={autoScrollRef} />
                                </ScrollArea>
                            )}
                        </TabsContent>

                        {!isDM && (
                            <TabsContent
                                value="participants"
                                className="flex-1 min-h-0 overflow-hidden"
                            >
                                {participants.length > 0 && (
                                    <ScrollArea className="h-full mb-10">
                                        {participants.map((parti: any) => {
                                            const presData = getPresence(parti.userId);

                                            const isOnline =
                                                presData?.online === true ||
                                                parti.userId === currentUser?.id;

                                            const lastSeenToday = presData?.lastSeen
                                                ? getLastSeenToday(presData.lastSeen)
                                                : null;

                                            return (
                                                <div
                                                    key={parti.user.id}
                                                    className="flex items-center gap-2 text-sm py-2"
                                                >
                                                    <div className="relative">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
                                                            <AvatarFallback>
                                                                {parti.user.username
                                                                    .substring(0, 2)
                                                                    .toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>

                                                        {isOnline && (
                                                            <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                                                        )}

                                                        {!isOnline && lastSeenToday && (
                                                            <span className="absolute bottom-0 right-0 w-6 h-4 text-[10px] flex items-center justify-center bg-green-500 border-2 border-white rounded-full">
                                                                {lastSeenToday}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span>{parti.user.username}</span>
                                                </div>
                                            );
                                        })}
                                    </ScrollArea>
                                )}
                            </TabsContent>
                        )}
                    </Tabs>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default ChatSettingsSheet;
