import { InfiniteData } from '@tanstack/react-query';

type NotificationData = { messageId: string } | Record<string, never>;

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
    type: 'NEW_CHAT' | 'GROUP_ADDED' | 'GROUP_INVITED' | 'MESSAGE_PINNED' | 'TITLE_UPDATED';
    data?: NotificationData;
    isRead: boolean;
    createdAt: string;
};

export type NotiResponse = {
    data: NotificationItem[];
    meta: {
        nextCursor: string | null;
    };
};

export type NotiInfiniteData = InfiniteData<NotiResponse>;
