import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MessageBubbleProps {
    content: string;
    isMe: boolean;
    createdAt: string;
    senderName?: string;
}

export const MessageBubble = ({ content, isMe, createdAt, senderName }: MessageBubbleProps) => {
    return (
        <div className={cn('flex flex-col mb-4', isMe ? 'items-end' : 'items-start')}>
            {!isMe && <span className="text-xs text-muted-foreground mb-1 ml-1">{senderName}</span>}
            <div
                className={cn(
                    'max-w-[75%] px-4 py-2 rounded-2xl text-sm',
                    isMe
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted text-foreground rounded-bl-none'
                )}
            >
                {content}
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                {format(new Date(createdAt), 'HH:mm')}
            </span>
        </div>
    );
};
