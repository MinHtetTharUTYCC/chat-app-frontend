'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePresenceStore } from '@/hooks/use-presence-store';
import { getLastSeenToday } from '@/lib/chat/last-seen-today';
import { cn, formatMessageDate } from '@/lib/utils';
import { useMemo } from 'react';

interface ChatItemProps {
    id: string;
    displayName: string;
    lastMessage?: string;
    timestamp?: string; // ISO string
    isActive: boolean;
    otherParticipants: any[];
    isDM: boolean;
    onClick: () => void;
}

export const ChatItem = ({
    id,
    displayName,
    lastMessage,
    timestamp,
    isActive,
    otherParticipants,
    isDM,
    onClick,
}: ChatItemProps) => {
    const { presence, getPresence } = usePresenceStore();

    const isOnline = useMemo(() => {
        if (isDM) return getPresence(otherParticipants[0]?.userId)?.online === true;

        return otherParticipants.some((p: any) => getPresence(p.userId)?.online);
    }, [presence]);

    const lastSeenToday = useMemo(() => {
        if (!isDM) return null;

        const lastSeen = getPresence(otherParticipants[0].userId)?.lastSeen || null;

        if (!lastSeen) return null;

        return getLastSeenToday(lastSeen);
    }, [presence]);

    return (
        <div
            onClick={onClick}
            className={cn(
                'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent/50',
                isActive && 'bg-accent text-accent-foreground'
            )}
        >
            <div className="relative">
                <Avatar className="h-10 w-10">
                    {/* <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${name}`} /> */}
                    <AvatarImage src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
                    <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
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
            <div className="flex-1 overflow-hidden">
                <span className="font-medium truncate">{displayName}</span>
                <div className="flex justify-between items-end">
                    <p className="flex-1 text-sm text-muted-foreground truncate">
                        {lastMessage || 'Start a conversation'}
                    </p>
                    {timestamp && (
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {formatMessageDate(timestamp)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
