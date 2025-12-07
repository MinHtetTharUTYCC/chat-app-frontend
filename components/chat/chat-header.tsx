'use client';

import { useAuthStore } from '@/hooks/use-auth-store';
import { useMemo } from 'react';

import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ArrowLeft, Phone } from 'lucide-react';
import { useAppStore } from '@/hooks/use-app-store';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { usePresenceStore } from '@/hooks/use-presence-store';
import ChatSettingsSheet from './chat-settings-sheet';

function ChatHeader({ chatId }: { chatId: string }) {
    const { currentUser } = useAuthStore();
    const { setChatsOpen } = useAppStore();

    const getPresence = usePresenceStore((state) => state.getPresence);
    // to listen at useMemo(presence_update makes changes to 'presence' by calling 'updatePresence')
    const presence = usePresenceStore((state) => state.presence);

    // Fetch specific chat details for header
    const { data: chatDetails, isLoading } = useQuery({
        queryKey: ['chat', chatId],
        queryFn: async () => (await api.get(`/chats/${chatId}`)).data,
        enabled: !!chatId,
    });

    const otherParticipants = useMemo(() => {
        return (
            chatDetails?.participants?.filter((parti: any) => parti.userId !== currentUser?.id) ||
            []
        );
    }, [chatDetails, currentUser?.id]);

    const isDM = useMemo(() => {
        return chatDetails && !chatDetails.isGroup && otherParticipants.length === 1;
    }, [chatDetails, otherParticipants]);

    const chatName = useMemo(() => {
        if (isDM) return otherParticipants[0]?.user.username || 'Unknown User';
        return chatDetails?.title || 'Group Chat';
    }, [chatDetails, otherParticipants]);

    const dmPresence = useMemo(() => {
        if (!isDM || otherParticipants.length === 0) return null;
        return getPresence(otherParticipants[0].userId);
    }, [isDM, otherParticipants, getPresence, presence]);

    const groupOnlineCount = useMemo(() => {
        if (isDM && otherParticipants.lenght === 0) return 0;

        return otherParticipants.filter((p: any) => {
            const presence = getPresence(p.userId);
            return presence?.online;
        }).length;
    }, [isDM, otherParticipants, getPresence, presence]);

    if (isLoading) {
        return (
            <div>
                <span className="animate-pulse font-semibold text-md">Loading...</span>
            </div>
        );
    }
    if (!chatDetails) {
        return (
            <div>
                <span className="font-semibold text-lg">Chat Not Found</span>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
                {/* Mobile Back Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setChatsOpen(true)}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="relative">
                    <Avatar className="h-8 w-8 z-10">
                        <AvatarImage src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
                        <AvatarFallback>{chatDetails?.isGroup ? 'GP' : 'DM'}</AvatarFallback>

                        {/* Online indicator for DM */}
                    </Avatar>
                    {isDM && dmPresence?.online && (
                        <span className="absolute bottom-0 right-0 z-20 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                </div>
                <div>
                    <h3 className="font-semibold text-sm">{chatName}</h3>
                    <span className="text-xs text-muted-foreground">
                        {isDM && dmPresence && (
                            <>
                                {dmPresence.online ? (
                                    <span className="text-green-500">Online</span>
                                ) : dmPresence.lastSeen ? (
                                    `Last seen ${formatDistanceToNow(
                                        new Date(parseInt(dmPresence.lastSeen)),
                                        {
                                            addSuffix: true,
                                        }
                                    )}`
                                ) : (
                                    'Offline'
                                )}
                            </>
                        )}
                        {!isDM && <span className="text-green-500">{groupOnlineCount} online</span>}
                    </span>
                </div>
            </div>
            <div className="flex gap-1">
                {/*TODO: mock/placeholder.NEED WebRTC is added */}
                <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                </Button>

                {/* Settings Sheet */}
                <ChatSettingsSheet
                    chatId={chatId}
                    isDM={isDM}
                    title={chatDetails.title}
                    dmParticipantname={isDM ? chatName : null}
                    participants={chatDetails.participants}
                    createdAt={chatDetails.createdAt}
                />
            </div>
        </div>
    );
}

export default ChatHeader;
