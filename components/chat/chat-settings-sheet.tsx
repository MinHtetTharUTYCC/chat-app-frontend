'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { Clock, Loader2, LogOut, MoreVertical, Users } from 'lucide-react';
import { useAppStore } from '@/hooks/use-app-store';
import { useEffect, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { usePresenceStore } from '@/hooks/use-presence-store';
import { getLastSeenToday } from '@/lib/chat/last-seen-today';
import { useAuthStore } from '@/hooks/use-auth-store';
import { Skeleton } from '../ui/skeleton';
import { ScrollArea } from '../ui/scroll-area';
import { cn, formatMessageDate } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import UpdateTitleDialog from './title/update-title-dialog';
import SearchMessageDialog from './search/search-message-dialog';
import UserAvatar from '../user/user-avatar';
import { PinItem } from '@/types/messages';
import { useLeaveGroup } from '@/hooks/chats/mutations/use-leave-group';
import { UserParticipant } from '@/types/chats';
import { usePinned } from '@/hooks/messages/queries/use-pinned';
import { InviteUserDialog } from '../dialogs/invite-users-dialog';
import { AddMembersDialog } from '../dialogs/add-members-dialog';

interface ChatSettingsSheetProps {
    chatId: string;
    isDM: boolean;
    title: string | null;
    dmParticipantname: string | null;
    participants: Array<UserParticipant>;
    createdAt: string;
}

export default function ChatSettingsSheet({
    chatId,
    isDM,
    title,
    dmParticipantname,
    participants,
    createdAt,
}: ChatSettingsSheetProps) {
    const searchParams = useSearchParams();
    const router = useRouter();

    const { setChatsOpen } = useAppStore();
    const getPresence = usePresenceStore((state) => state.getPresence);
    const { currentUser } = useAuthStore();

    const [chatName, setChatName] = useState(dmParticipantname || title || 'Chat Info');

    const autoScrollRef = useRef<HTMLDivElement | null>(null);
    const autoLoadRef = useRef<HTMLDivElement | null>(null);

    const [hasScrolled, setHasScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isEditTitleOpen, setEditTitleOpen] = useState(false);

    const {
        data: pinned,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isPinnedLoading,
    } = usePinned({ chatId, isSheetOpen: isOpen });

    const { mutate: mutateLeaveGroup, isPending: isLeavingGroup } = useLeaveGroup(chatId);

    const handlePinMsgClick = async (messageId: string) => {
        const params = new URLSearchParams(searchParams);
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
        } else if (prevScrollHeightRef.current > 0) {
            // Restore after fetch completes
            const heightDiff = el.scrollHeight - prevScrollHeightRef.current;
            el.scrollTop = el.scrollTop + heightDiff;
            prevScrollHeightRef.current = 0;
        }
    }, [isFetchingNextPage]);

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
    }, [isOpen, chatId, pinned, hasScrolled]);

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

    const pinnedMessages: PinItem[] =
        pinned?.pages
            .flatMap((page) => (Array.isArray(page) ? page : page.pinnedMessages || []))
            .reverse() || [];

    return (
        <Sheet
            open={isOpen}
            onOpenChange={(val) => {
                setIsOpen(val);
                if (!val) {
                    setHasScrolled(false);
                }
            }}
        >
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="cursor-pointer">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </SheetTrigger>
            <SheetContent
                className="flex flex-col h-screen max-h-screen p-2"
                aria-describedby={undefined}
            >
                <div className="shrink-0 space-y-4 pb-4">
                    <SheetHeader aria-describedby={undefined}>
                        <SheetTitle className="mr-4 flex gap-2 overflow-x-clip">
                            <p className="flex-1">{chatName}</p>
                            {!isDM && (
                                <UpdateTitleDialog
                                    key={`${chatId}${isOpen}`}
                                    chatId={chatId}
                                    title={title || 'Group Chat'}
                                    setChatTitle={setChatName}
                                    isOpen={isEditTitleOpen}
                                    setIsOpen={setEditTitleOpen}
                                    closeSheet={() => setIsOpen(false)}
                                />
                            )}
                            <SearchMessageDialog
                                chatId={chatId}
                                isOpen={isSearchOpen}
                                setIsOpen={setIsSearchOpen}
                                closeSheet={() => setIsOpen(false)}
                            />
                        </SheetTitle>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="h-3 w-3" />
                                <p className="text-xs">{participants.length} participants</p>
                            </div>

                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <p className="text-xs">
                                    {isDM ? 'Chat started ' : 'Group created '}
                                    {formatDistanceToNow(new Date(createdAt), {
                                        addSuffix: true,
                                    })}
                                </p>
                            </div>
                        </div>
                    </SheetHeader>

                    {!isDM && (
                        <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() =>
                                mutateLeaveGroup(undefined, {
                                    onSuccess: () => {
                                        setIsOpen(false);
                                        setChatsOpen(true);
                                    },
                                })
                            }
                            disabled={isLeavingGroup}
                        >
                            {isLeavingGroup ? <Loader2 className="animate-spin" /> : <LogOut />}
                            Leave Group
                        </Button>
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
                                <p className="mt-10 text-center text-sm text-muted-foreground">
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

                                    {pinnedMessages.map((pinMsg) => {
                                        const isMe = pinMsg.message.senderId === currentUser?.id;
                                        return (
                                            <div
                                                key={pinMsg.id}
                                                className={`flex items-end gap-2 p-2`}
                                            >
                                                {!isMe && (
                                                    <UserAvatar username={pinMsg.user.username} />
                                                )}
                                                <div
                                                    className={`flex flex-col ${isMe && 'ml-auto'}`}
                                                >
                                                    <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                                                        {formatMessageDate(pinMsg.createdAt)}
                                                    </span>
                                                    <div
                                                        className={cn(
                                                            'text-foreground px-4 py-2 rounded-2xl text-sm cursor-pointer',
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
                                        <div className="flex items-center justify-around gap-2">
                                            <AddMembersDialog chatId={chatId} />
                                            <InviteUserDialog chatId={chatId} />
                                        </div>
                                        {participants.map((parti) => {
                                            const presData = getPresence(parti.user.id);

                                            const isOnline =
                                                presData?.online === true ||
                                                parti.user.id === currentUser?.id;

                                            const lastSeenToday = presData?.lastSeen
                                                ? getLastSeenToday(presData.lastSeen)
                                                : null;

                                            return (
                                                <div
                                                    key={parti.user.id}
                                                    className="flex items-center gap-2 text-sm py-2"
                                                >
                                                    <div className="relative">
                                                        <UserAvatar
                                                            username={parti.user.username}
                                                            size={'size-8'}
                                                        />

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
