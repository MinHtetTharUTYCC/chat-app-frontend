import { InfiniteData } from '@tanstack/react-query';

export type NotificationItem = {
    id: string;
    chatId: string;
    receiverId: string;
    actorId: string;
    actor: {
        id: string;
        username: string;
    };
    chat: {
        id: string;
        title: string | null;
    };
    type: 'NEW_CHAT' | 'GROUP_ADDED' | 'GROUP_INVITED' | 'MESSAGE_PINNED';
    data?: Record<string, any>;
    isRead: boolean;
    createdAt: string;
};

export type NotiResponse = {
    data: NotificationItem[];
    meta: {
        hasMore: boolean;
        nextCursor: string | null;
    };
};

export type NotiInfiniteData = InfiniteData<NotiResponse>;
