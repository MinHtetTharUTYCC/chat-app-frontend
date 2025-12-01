'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePresenceStore } from '@/hooks/use-presence-store';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useMemo } from 'react';

interface ChatItemProps {
    id: string;
    name: string;
    lastMessage?: string;
    timestamp?: string; // ISO string
    isActive: boolean;
    otherParticipants: any[];
    isDM: boolean;
    onClick: () => void;
}

export const ChatItem = ({
    id,
    name,
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
    return (
        <div
            onClick={onClick}
            className={cn(
                'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent/50',
                isActive && 'bg-accent text-accent-foreground'
            )}
        >
            <div className="relative">
                <Avatar>
                    {/* <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${name}`} /> */}
                    <AvatarImage src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
                    <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                )}
            </div>
            <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                    <span className="font-medium truncate">{name}</span>
                    {timestamp && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(timestamp), 'HH:mm')}
                        </span>
                    )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                    {lastMessage || 'Start a conversation'}
                </p>
            </div>
        </div>
    );
};
