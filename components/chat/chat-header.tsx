'use client';

import { useAuthStore } from '@/hooks/use-auth-store';
import { useMemo } from 'react';

import { Button } from '../ui/button';
import { ArrowLeft, Phone } from 'lucide-react';
import { useAppStore } from '@/hooks/use-app-store';
import { formatDistanceToNow } from 'date-fns';
import { usePresenceStore } from '@/hooks/use-presence-store';
import ChatSettingsSheet from './chat-settings-sheet';
import UserAvatar from '../user/user-avatar';
import { ChatDetailsResponse } from '@/types/chats';

interface ChatHeaderProps {
    chatId: string;
    chatDetails: ChatDetailsResponse;
}

function ChatHeader({ chatId, chatDetails }: ChatHeaderProps) {
    const { currentUser } = useAuthStore();
    const { setChatsOpen } = useAppStore();

    // to listen at useMemo(presence_update makes changes to 'presence' by calling 'updatePresence')
    const presence = usePresenceStore((state) => state.presence);

    const otherParticipants = useMemo(() => {
        return (
            chatDetails?.participants?.filter((parti) => parti.user.id !== currentUser?.id) || []
        );
    }, [chatDetails, currentUser?.id]);

    const isDM = useMemo(() => {
        return !!chatDetails && !chatDetails.isGroup && otherParticipants.length === 1;
    }, [chatDetails, otherParticipants]);

    const chatName = useMemo(() => {
        if (isDM) return otherParticipants[0]?.user.username || 'Unknown User';
        return chatDetails?.title || 'Group Chat';
    }, [isDM, chatDetails, otherParticipants]);

    const dmPresence = useMemo(() => {
        if (!isDM || otherParticipants.length === 0) return null;
        return presence[otherParticipants[0].user.id] ?? null;
    }, [isDM, otherParticipants, presence]);

    const groupOnlineCount = useMemo(() => {
        if (isDM) return 0;

        let count = 0;

        for (const p of otherParticipants) {
            if (presence[p.user.id]?.online) {
                count++;
            }
        }

        return count;
    }, [isDM, otherParticipants, presence]);

    if (!chatDetails) {
        return (
            <div className="flex items-center justify-between p-4 border-b">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setChatsOpen(true)}
                    className="md:hidden"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
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
                    <UserAvatar size="size-8" username={chatName} />
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
            {chatDetails.isParticipant && (
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
                        participants={chatDetails.participants || []}
                        createdAt={chatDetails.createdAt}
                    />
                </div>
            )}
        </div>
    );
}

export default ChatHeader;
