'use client';

import { usePresenceStore } from '@/hooks/use-presence-store';
import { getLastSeenToday } from '@/lib/chat/last-seen-today';
import { cn, formatMessageDate } from '@/lib/utils';
import UserAvatar from '../user/user-avatar';
import { useMemo } from 'react';

interface ChatItemProps {
    displayName: string;
    isDM: boolean;
    lastMsgText?: string;
    isActive: boolean;
    otherParticipants: string[];
    timestamp?: string;
    onClick: () => void;
}

export const ChatItem = ({
    displayName,
    isDM,
    lastMsgText: lastMessage,
    isActive,
    otherParticipants,
    timestamp,
    onClick,
}: ChatItemProps) => {
    const { getPresence } = usePresenceStore();

    const isOnline = useMemo(() => {
        if (isDM) return getPresence(otherParticipants[0])?.online === true;

        return otherParticipants.some((userId) => getPresence(userId)?.online);
    }, [isDM, otherParticipants, getPresence]);

    const lastSeenToday = useMemo(() => {
        if (!isDM) return null;

        const lastSeen = getPresence(otherParticipants[0])?.lastSeen || null;

        if (!lastSeen) return null;

        return getLastSeenToday(lastSeen);
    }, [isDM, otherParticipants, getPresence]);

    return (
        <div
            onClick={onClick}
            className={cn(
                'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent/50 overflow-hidden',
                isActive && 'bg-accent text-accent-foreground'
            )}
        >
            <div className="relative shrink-0">
                <UserAvatar size="size-10" username={displayName} />
                {isOnline && (
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                )}
                {!isOnline && lastSeenToday && (
                    <span className="absolute bottom-0 right-0 w-6 h-4 text-[10px] flex items-center justify-center bg-green-500 border-2 border-white rounded-full">
                        {lastSeenToday}
                    </span>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <span className="block font-medium truncate">{displayName}</span>
                <div className="flex justify-between items-end text-muted-foreground">
                    <p className="flex-1 min-w-0 text-sm line-clamp-1">
                        {lastMessage || 'Start a conversation'}
                    </p>
                    {timestamp && (
                        <span className="text-[10px] whitespace-nowrap">
                            {formatMessageDate(timestamp)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
