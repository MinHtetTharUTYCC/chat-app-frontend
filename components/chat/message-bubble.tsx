import { cn, formatMessageDate } from '@/lib/utils';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Span } from 'next/dist/trace';
import { Sarpanch } from 'next/font/google';

interface MessageBubbleProps {
    content: string;
    isMe: boolean;
    createdAt: string;
    senderName?: string;
    isOptimistic?: boolean;
}

export const MessageBubble = ({
    content,
    isMe,
    createdAt,
    senderName,
    isOptimistic = false,
}: MessageBubbleProps) => {
    return (
        <div className={cn('flex items-end mb-4')}>
            {!isMe && (
                <Avatar className="h-6 w-6">
                    <AvatarImage src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
                    <AvatarFallback>{senderName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
            )}
            <div className={cn('flex flex-col', isMe ? 'items-end' : 'items-start')}>
                {!isMe && (
                    <span className="text-xs text-muted-foreground mb-1 ml-1">{senderName}</span>
                )}
                <div
                    className={cn(
                        'max-w-[75%] px-4 py-2 rounded-2xl text-sm',
                        isOptimistic && 'opacity-70',
                        isMe
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : 'bg-muted text-foreground rounded-bl-none'
                    )}
                >
                    {content}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                    {formatMessageDate(createdAt)}
                </span>
                {isOptimistic && (
                    <span className="text-[10px] text-muted-foreground mt-1 mx-1">sending...</span>
                )}
            </div>
        </div>
    );
};
