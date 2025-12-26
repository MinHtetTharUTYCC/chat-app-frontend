'use client';

import { NotificationItem } from '@/types/notifications';
import { formatDistanceToNow } from 'date-fns';
import UserAvatar from '../user/user-avatar';
import { memo } from 'react';

const NotiItem = memo(
    ({
        notification,
        onNotiClick,
    }: {
        notification: NotificationItem;
        onNotiClick: () => void;
    }) => {
        const { actor, chat, type, createdAt } = notification;

        let content = 'New Notification';
        switch (type) {
            case 'NEW_CHAT':
                content = `${actor.username} started a new chat with you.`;
                break;
            case 'GROUP_ADDED':
                content = `${actor.username} added you to a group${
                    chat.title ? `: ${chat.title}.` : '.'
                }`;
                break;
            case 'MESSAGE_PINNED':
                content = `${actor.username} pinned your message${
                    chat.title ? ` in ${chat.title}.` : '.'
                }`;
                break;
        }

        return (
            <div
                className="p-3 border-b text-muted-foreground hover:bg-accent rounded-md cursor-pointer"
                onClick={onNotiClick}
            >
                <div className="flex items-center gap-2">
                    <UserAvatar username={actor.username} size="size-8" />
                    <p className="flex-1 text-sm line-clamp-2">{content}</p>
                </div>
                <p className="w-full text-xs mt-1 text-end">
                    {formatDistanceToNow(new Date(createdAt), {
                        addSuffix: true,
                    })}
                </p>
            </div>
        );
    }
);

NotiItem.displayName = 'NotiItem';
export default NotiItem;
