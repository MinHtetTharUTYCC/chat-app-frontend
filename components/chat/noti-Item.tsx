import { NotificationItem } from '@/types/types';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Link from 'next/link';

function NotiItem({ notification }: { notification: NotificationItem }) {
    const { id, chatId, actor, chat,type, data, isRead, createdAt } = notification;
    let content = 'New message';
    
    switch (type) {
        case 'NEW_CHAT':
            content = `${actor.username} started a new chat with you.`;
            break;
        case 'GROUP_ADDED':
            content = `${actor.username} added you to a group${chat.title ? `: ${chat.title}.` : '.'}.`;
            break;
        case 'MESSAGED_PINNED':
            content = `${actor.username} pinned your message${chat.title ? `: ${chat.title}.` : '.'}.`;
            break;
    }

    return (
        <Link href={`/chats/${chatId}`} className="p-3 border-b hover:bg-accent text-sm">
            <div className="flex gap-2">
                <Avatar className="h-6 w-6 bg-secondary cursor-pointer">
                    <AvatarImage src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
                    <AvatarFallback className="w-full flex items-center justify-center">
                        <p className="text-center text-xs">
                            {actor.username.substring(0, 2).toUpperCase()}
                        </p>
                    </AvatarFallback>
                </Avatar>
                <p className="text-muted-foreground">{content}</p>
            </div>
            <span className="text-xs text-muted-foreground mt-1 block">
                {formatDistanceToNow(new Date(createdAt), {
                    addSuffix: true,
                })}
            </span>
        </Link>
    );
}

export default NotiItem;
