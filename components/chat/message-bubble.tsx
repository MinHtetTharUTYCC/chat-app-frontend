import { cn, formatMessageDate } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';


interface MessageBubbleProps {
    msgId: string;
    content: string;
    isMe: boolean;
    createdAt: string;
    senderName?: string;
    isOptimistic?: boolean;
    highlightText?: string;
    onMsgClick?: () => void;
}

export const MessageBubble = ({
    msgId,
    content,
    isMe,
    createdAt,
    senderName,
    isOptimistic = false,
    highlightText = '',
    onMsgClick,
}: MessageBubbleProps) => {
    const contentToDisplay = () => {
        //if not highlightText or content
        if (!highlightText || !content) {
            return content;
        }

        // Escape special regex characters in the highlight text
        const escapedText = highlightText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Create a global, case-insensitive RegExp
        const regex = new RegExp(`(${escapedText})`, 'gi');

        // Split the content using the regex. The capturing group () ensures
        // the delimiter (the match) is also included in the resulting array.
        const parts = content.split(regex);

        return parts.map((part, index) => {
            // Check if the current part matches the highlight text (case-insensitive)
            if (regex.test(part)) {
                // If it matches, wrap it in a span with the highlight class
                return (
                    <span
                        key={index}
                        className="bg-yellow-400 text-black rounded px-0.5 -mx-px"
                    >
                        {part}
                    </span>
                );
            }
            // If it doesn't match, return the text part as is
            return part;
        });
    };


    return (
        <div className={cn('max-w-[75%] flex items-end gap-1 mb-4')}>
            {!isMe && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
                    <AvatarFallback className="text-xs">
                        {senderName?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            )}
            <div className={cn('flex flex-col', isMe ? 'items-end' : 'items-start')}>
                <div className="flex items-center justify-start gap-2">
                    {!isMe && <span className="text-xs text-muted-foreground">{senderName}</span>}
                    <span className="text-[10px] text-muted-foreground">
                        {formatMessageDate(createdAt)}
                    </span>
                </div>
                <div
                    id={`message-${msgId}`}
                    className={cn(
                        'px-4 py-2 rounded-2xl text-sm cursor-pointer',
                        isOptimistic && 'opacity-70',
                        isMe
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : 'bg-muted text-foreground rounded-bl-none'
                    )}
                    onClick={onMsgClick ?? undefined}
                >
                    {contentToDisplay()}
                </div>
                {isOptimistic && (
                    <span className="text-[10px] text-muted-foreground mt-1 mx-1">sending...</span>
                )}
            </div>
        </div>
    );
};
