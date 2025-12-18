export interface ChatItemResponse {
    id: string;
    isGroup: boolean;
    title: string | null;
    createdAt: Date;
    updatedAt: Date;
    lastMessageAt: Date;
    participants: {
        id: string;
        userId: string;
        chatId: string;
        user: { id: string; username: string };
    }[];
    messages: {
        id: string;
        content: string;
        createdAt: Date;
        updatedAt: Date;
        senderId: string;
        sender: { id: string; username: string };
    }[];
}

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
    type: 'NEW_CHAT' | 'GROUP_ADDED' | 'MESSAGED_PINNED';
    data?: JSON;
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

export type PresenceResponse = Record<string, { online: boolean; lastSeen: string | null }>;
